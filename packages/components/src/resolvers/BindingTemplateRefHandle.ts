import { DecoratorProvider, PromiseUtil, lang } from '@tsdi/ioc';
import { BuildContext, StartupDecoratorRegisterer, StartupScopes } from '@tsdi/boot';
import { IComponentReflect } from '../IComponentReflect';
import { ComponentProvider } from '../ComponentProvider';
import { CTX_COMPONENT_REF, ElementRef, ComponentRef } from '../ComponentRef';


/**
 * binding temlpate handle.
 *
 * @export
 * @class BindingTemplateHandle
 * @extends {ResolveHandle}
 */
export const BindingTemplateRefHandle = async function (ctx: BuildContext, next?: () => Promise<void>): Promise<void> {
    let reflects = ctx.reflects;
    let ref = ctx.targetReflect as IComponentReflect;
    let actInjector = reflects.getActionInjector();
    if (ref && ref.propRefChildBindings) {
        let dpr = actInjector.getInstance(DecoratorProvider);
        if (dpr.has(ctx.decorator, ComponentProvider)) {
            // todo ref child view
            let refSelector = dpr.resolve(ctx.decorator, ComponentProvider);
            let cref = ctx.getValue(CTX_COMPONENT_REF);
            ref.propRefChildBindings.forEach(b => {
                let result = refSelector.select(cref, b.bindingName || b.name);
                if (result) {
                    if (reflects.isExtends(b.type, ElementRef)) {
                        ctx.value[b.name] = refSelector.getElementRef(result, ctx.injector) ?? refSelector.createElementRef(ctx, result);
                    } else if (reflects.isExtends(b.type, ComponentRef)) {
                        ctx.value[b.name] = refSelector.getComponentRef(result, ctx.injector) ?? refSelector.createComponentRef(lang.getClass(result), result, ctx);
                    } else {
                        ctx.value[b.name] = result;
                    }
                }
            });
        }
    }

    let startupRegr = actInjector.getInstance(StartupDecoratorRegisterer);

    let bindRegs = startupRegr.getRegisterer(StartupScopes.Binding);
    if (bindRegs.has(ctx.decorator)) {
        await PromiseUtil.runInChain(bindRegs.getFuncs(this.actInjector, ctx.decorator), ctx);
    }

    if (next) {
        await next();
    }
};
