import { DesignContext, CTX_CURR_DECOR, IProviders, DecoratorProvider, lang } from '@tsdi/ioc';
import { IComponentMetadata } from '../decorators/metadata';
import { IComponentReflect } from '../IReflect';
import { CompilerFacade } from '../compile/CompilerFacade';

/**
 * component def compile action.
 * @param ctx
 * @param next
 */
export const ComponentDefAction = function (ctx: DesignContext, next: () => void): void {

    let currDecor = ctx.getValue(CTX_CURR_DECOR);
    let compRefl = ctx.targetReflect as IComponentReflect;
    let injector = ctx.injector;
    let metas = ctx.reflects.getMetadata<IComponentMetadata>(currDecor, ctx.type);
    let prdrs: IProviders;
    if (!compRefl.getDecorProviders) {
        prdrs = ctx.reflects.getActionInjector().getInstance(DecoratorProvider).getProviders(currDecor);
        if (prdrs) {
            compRefl.getDecorProviders = () => prdrs;
        }
    } else {
        prdrs = compRefl.getDecorProviders();
    }

    compRefl.decorator = currDecor;
    compRefl.component = true;
    if (ctx.type.ρCmp) {
        compRefl.componentDef = ctx.type.ρCmp();
    } else {
        const compiler = prdrs.getInstance(CompilerFacade);
        compRefl.componentDef = compiler.compileComponent(lang.first(metas));
        // todo: compiler componet to componentDef.
    }

    next();

};
