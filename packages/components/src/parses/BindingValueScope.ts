import { isNullOrUndefined, lang, isString, isBaseType, isClassType, ClassType, PromiseUtil } from '@tsdi/ioc';
import { StartupDecoratorRegisterer, StartupScopes, BaseTypeParser } from '@tsdi/boot';
import { ParsersHandle } from './ParseHandle';
import { ParseContext } from './ParseContext';
import { TemplateParseScope } from './TemplateParseScope';
import { TemplateContext } from './TemplateContext';
import { ComponentBuilderToken } from '../IComponentBuilder';
import { DataBinding } from '../bindings/DataBinding';
import { BindingDirection } from '../bindings/IBinding';
import { OneWayBinding } from '../bindings/OneWayBinding';
import { TwoWayBinding } from '../bindings/TwoWayBinding';
import { EventBinding } from '../bindings/EventBinding';
import { ParseBinding } from '../bindings/ParseBinding';
import { getAttrSelectorToken } from '../decorators/Component';
import { IComponentReflect } from '../IComponentReflect';


/**
 * binding value scope.
 *
 * @export
 * @class BindingValueScope
 * @extends {ParsersHandle}
 */
export class BindingValueScope extends ParsersHandle {
    setup() {
        this.use(BindingScopeHandle)
            .use(TranslateExpressionHandle)
            .use(TranslateAtrrHandle)
            .use(AssignBindValueHandle)
            .use(AssignDefaultValueHandle);
    }
}

const bindPref = 'binding:';
const twobindPref = 'binding=:';
const two2bindPref = '[(binding)]:';
const eventBindPref = '(binding):'
/**
 * binding scope handle.
 *
 * @export
 * @class BindingScopeHandle
 * @extends {ParseHandle}
 */
export const BindingScopeHandle = async function (ctx: ParseContext, next?: () => Promise<void>): Promise<void> {
    if (!ctx.dataBinding && ctx.bindExpression instanceof DataBinding) {
        ctx.dataBinding = ctx.bindExpression;
    }
    let options = ctx.getOptions();
    if (!ctx.dataBinding && isString(ctx.bindExpression)) {
        let actInjector = ctx.reflects.getActionInjector();
        let regs = actInjector.getInstance(StartupDecoratorRegisterer)
            .getRegisterer(StartupScopes.BindExpression);
        // translate binding expression via current decorator.
        if (regs.has(ctx.decorator)) {
            await PromiseUtil.runInChain(regs.getFuncs(actInjector, ctx.decorator), ctx);
        } else {
            let exp = ctx.bindExpression.trim();
            if (ctx.binding.direction === BindingDirection.input) {
                if (exp.startsWith(bindPref)) {
                    ctx.dataBinding = new OneWayBinding(ctx.injector, options.scope, ctx.binding, exp.replace(bindPref, '').trim());
                } else if (exp.startsWith(twobindPref)) {
                    ctx.dataBinding = new TwoWayBinding(ctx.injector, options.scope, ctx.binding, exp.replace(twobindPref, '').trim());
                } else if (exp.startsWith(two2bindPref)) {
                    ctx.dataBinding = new TwoWayBinding(ctx.injector, options.scope, ctx.binding, exp.replace(two2bindPref, '').trim());
                }
            } else if (ctx.binding.direction === BindingDirection.output && exp.startsWith(eventBindPref)) {
                ctx.dataBinding = new EventBinding(ctx.injector, options.scope, ctx.binding, exp.replace(eventBindPref, '').trim());
            }
        }
    }

    if (ctx.dataBinding instanceof ParseBinding) {
        if (!ctx.dataBinding.source) {
            ctx.dataBinding.source = options.scope;
        }
        options.bindExpression = ctx.dataBinding.resolveExression();
    } else if (ctx.dataBinding instanceof DataBinding) {
        if (!ctx.dataBinding.source) {
            ctx.dataBinding.source = options.scope;
        }
        ctx.value = ctx.dataBinding.resolveExression();
    }

    if (next && isNullOrUndefined(ctx.value)) {
        await next();
    }
};


export const TranslateExpressionHandle = async function (ctx: ParseContext, next: () => Promise<void>): Promise<void> {
    let options = ctx.getOptions();
    if (!isNullOrUndefined(ctx.bindExpression)) {
        let tpCtx = TemplateContext.parse(ctx.injector, {
            scope: options.scope,
            template: ctx.bindExpression,
            decorator: ctx.decorator,
            providers: ctx.providers
        });
        await ctx.reflects.getActionInjector()
            .get(TemplateParseScope)
            .execute(tpCtx);

        if (!isNullOrUndefined(tpCtx.value)) {
            if (ctx.reflects.isExtends(lang.getClass(tpCtx.value), ctx.binding.type)) {
                ctx.value = tpCtx.value;
            } else {
                options.bindExpression = tpCtx.value;
            }
        }
    }
    if (isNullOrUndefined(ctx.value)) {
        await next();
    }
};

/**
 * translate attr hanlde.
 *
 * @export
 * @class TranslateAtrrHandle
 * @extends {ParseHandle}
 */
export const TranslateAtrrHandle = async function (ctx: ParseContext, next: () => Promise<void>): Promise<void> {
    let options = ctx.getOptions();
    let injector = ctx.injector;
    if (!isNullOrUndefined(ctx.bindExpression)) {
        let pdr = ctx.binding.provider;
        let selector: ClassType;
        if (isString(pdr) && injector.hasRegister(getAttrSelectorToken(pdr))) {
            selector = injector.getTokenProvider(getAttrSelectorToken(pdr));
        } else if (ctx.binding.type !== Array) {
            if (isClassType(ctx.binding.provider)) {
                if (ctx.reflects.get<IComponentReflect>(ctx.binding.provider).component) {
                    selector = ctx.binding.provider;
                }
            }
            if (!selector && isClassType(ctx.binding.type)) {
                if (ctx.reflects.get<IComponentReflect>(ctx.binding.type).component) {
                    selector = ctx.binding.type;
                }
            }
        }

        if (selector) {
            let template = {};
            template[ctx.binding.bindingName || ctx.binding.name] = ctx.bindExpression;
            ctx.value = await injector.get(ComponentBuilderToken).resolveRef({
                type: selector,
                scope: options.scope,
                template: template,
                providers: ctx.providers,
                injector: ctx.injector
            });
        }
    }

    if (isNullOrUndefined(ctx.value)) {
        await next();
    }
};


export const AssignBindValueHandle = async function (ctx: ParseContext, next: () => Promise<void>): Promise<void> {
    if (!isNullOrUndefined(ctx.bindExpression)) {
        let type = ctx.binding.type;
        if (isBaseType(type)) {
            ctx.value = ctx.get(BaseTypeParser).parse(type, ctx.bindExpression);
        } else if (isClassType(type)) {
            let ttype = lang.getClass(ctx.bindExpression);
            if (ctx.reflects.isExtends(ttype, type)) {
                ctx.value = ctx.bindExpression;
            }
        } else {
            ctx.value = ctx.bindExpression;
        }
    }

    if (isNullOrUndefined(ctx.value)) {
        await next();
    }
};

export const AssignDefaultValueHandle = async function (ctx: ParseContext, next: () => Promise<void>): Promise<void> {
    ctx.value = ctx.binding.defaultValue;
    if (isNullOrUndefined(ctx.value)) {
        await next();
    }
};
