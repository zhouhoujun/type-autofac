import { DesignContext, CTX_CURR_DECOR, IProviders, DecoratorProvider, lang } from '@tsdi/ioc';
import { IComponentMetadata } from '../decorators/IComponentMetadata';
import { IComponentReflect } from '../IComponentReflect';
import { CompilerFacade } from '../compile/CompilerFacade';

export const ComponentCompileAction = function (ctx: DesignContext, next: () => void): void {

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
    if (ctx.type.d0Cmp) {
        compRefl.componentDef = ctx.type.d0Cmp();
    } else {
        const compiler = prdrs.getInstance(CompilerFacade);
        compRefl.componentDef = compiler.compileComponent(lang.first(metas));
        // todo: compiler componet to componentDef.
    }

    // metas.forEach(meta => {
    //     if (!meta.selector) {
    //         return;
    //     }
    //     if (meta.selector.indexOf(',') > 0) {
    //         meta.selector.split(',').forEach(sel => {
    //             sel = sel.trim();
    //             if (attrExp.test(sel)) {
    //                 compRefl.attrSelector = sel;
    //                 injector.bindProvider(compdr.toAttrSelectorToken(sel), ctx.type);
    //             } else {
    //                 compRefl.selector = sel;
    //                 injector.bindProvider(compdr.toSelectorToken(sel), ctx.type);
    //             }
    //         })
    //     } else {
    //         if (attrExp.test(meta.selector)) {
    //             compRefl.attrSelector = meta.selector;
    //             injector.bindProvider(compdr.toAttrSelectorToken(meta.selector), ctx.type);
    //         } else {
    //             compRefl.selector = meta.selector;
    //             injector.bindProvider(compdr.toSelectorToken(meta.selector), ctx.type);
    //         }
    //     }
    // });

    next();

};