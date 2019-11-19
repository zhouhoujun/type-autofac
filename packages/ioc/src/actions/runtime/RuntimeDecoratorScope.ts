
import { DecoratorsRegisterer, DecoratorScopes, RuntimeRegisterer } from '../DecoratorsRegisterer';
import { IocDecoratorScope } from '../IocDecoratorScope';
import { ObjectMap } from '../../types';
import { RuntimeDecoratorAction } from './RuntimeDecoratorAction';
import { RuntimeActionContext, CTX_PROPERTYKEY } from './RuntimeActionContext';

const CTX_CLASS_DECORS = 'CTX_CLASS_DECORS';
const CTX_METHOD_DECORS = 'CTX_METHOD_DECORS';
const CTX_PROPS_DECORS = 'CTX_PROPS_DECORS';
const CTX_PARAM_DECORS = 'CTX_PARAM_DECORS';
const CTX_BEFORE_CSTR_DECORS = 'CTX_BEFORE_CSTR_DECORS';
const CTX_AFTER_CSTR_DECORS = 'CTX_AFTER_CSTR_DECORS';

export abstract class RuntimeDecoratorScope extends IocDecoratorScope<RuntimeActionContext> {

    protected getState(ctx: RuntimeActionContext, dtype: DecoratorScopes): ObjectMap<boolean> {
        switch (dtype) {
            case DecoratorScopes.Class:
                return this.getClassDecorState(ctx);
            case DecoratorScopes.Method:
                return this.getMethodDecorState(ctx);
            case DecoratorScopes.Property:
                return this.getPropDecorState(ctx);
            case DecoratorScopes.Parameter:
                return this.getParamDecorState(ctx);
            case DecoratorScopes.BeforeConstructor:
                return this.getBeforeCstrDecorsState(ctx);
            case DecoratorScopes.AfterConstructor:
                return this.getAfterCstrDecorsState(ctx);
        }
        return null;
    }

    protected getClassDecorState(ctx: RuntimeActionContext): ObjectMap<boolean> {
        if (!ctx.hasContext(CTX_CLASS_DECORS)) {
            let classDecors = ctx.targetReflect
                .decorators.runtime.classDecors
                .reduce((obj, dec) => {
                    obj[dec] = false;
                    return obj;
                }, {});
            ctx.setContext(CTX_CLASS_DECORS, classDecors);
        }
        return ctx.getContext(CTX_CLASS_DECORS);
    }

    protected getMethodDecorState(ctx: RuntimeActionContext): ObjectMap<boolean> {
        if (!ctx.hasContext(CTX_METHOD_DECORS)) {
            let methodDecors = ctx.targetReflect
                .decorators.runtime.methodDecors
                .reduce((obj, dec) => {
                    obj[dec] = false;
                    return obj;
                }, {});
            ctx.setContext(CTX_METHOD_DECORS, methodDecors);
        }
        return ctx.getContext(CTX_METHOD_DECORS);
    }

    protected getPropDecorState(ctx: RuntimeActionContext): ObjectMap<boolean> {
        if (!ctx.hasContext(CTX_PROPS_DECORS)) {
            let propsDecors = ctx.targetReflect
                .decorators.runtime.propsDecors
                .reduce((obj, dec) => {
                    obj[dec] = false;
                    return obj;
                }, {});
            ctx.setContext(CTX_PROPS_DECORS, propsDecors);
        }
        return ctx.getContext(CTX_PROPS_DECORS);
    }

    protected getParamDecorState(ctx: RuntimeActionContext): ObjectMap<boolean> {
        if (!ctx.hasContext(CTX_PARAM_DECORS)) {
            let paramDecors = ctx.targetReflect
                .decorators.runtime.getParamDecors(ctx.getContext(CTX_PROPERTYKEY), ctx.target)
                .reduce((obj, dec) => {
                    obj[dec] = false;
                    return obj;
                }, {});
            ctx.setContext(CTX_PARAM_DECORS, paramDecors);
        }
        return ctx.getContext(CTX_PARAM_DECORS);
    }

    protected getBeforeCstrDecorsState(ctx: RuntimeActionContext): ObjectMap<boolean> {
        if (!ctx.hasContext(CTX_BEFORE_CSTR_DECORS)) {
            let beforeCstrDecors = ctx.targetReflect
                .decorators.runtime.beforeCstrDecors
                .reduce((obj, dec) => {
                    obj[dec] = false;
                    return obj;
                }, {});
            ctx.setContext(CTX_BEFORE_CSTR_DECORS, beforeCstrDecors);
        }
        return ctx.getContext(CTX_BEFORE_CSTR_DECORS);
    }

    protected getAfterCstrDecorsState(ctx: RuntimeActionContext): ObjectMap<boolean> {
        if (!ctx.hasContext(CTX_AFTER_CSTR_DECORS)) {
            let afterCstrDecors = ctx.targetReflect
                .decorators.runtime.afterCstrDecors
                .reduce((obj, dec) => {
                    obj[dec] = false;
                    return obj;
                }, {});
            ctx.setContext(CTX_AFTER_CSTR_DECORS, afterCstrDecors);
        }
        return ctx.getContext(CTX_AFTER_CSTR_DECORS);
    }

    protected getScopeRegisterer(): DecoratorsRegisterer {
        return this.container.getInstance(RuntimeRegisterer);
    }

    setup() {
        this.use(RuntimeDecoratorAction);
    }

}
