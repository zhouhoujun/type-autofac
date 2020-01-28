import { isNullOrUndefined } from '@tsdi/ioc';
import { IBuildContext } from '@tsdi/boot';
import { IComponentReflect } from '../IComponentReflect';
import { ParseContext } from '../parses/ParseContext';
import { BindingScopeHandle } from '../parses/BindingValueScope';
import { Output } from '../decorators/Output';


export const BindingOutputHandle = async function (ctx: IBuildContext, next: () => Promise<void>): Promise<void> {

    let refl = ctx.targetReflect as IComponentReflect;
    let propOutBindings = refl?.getBindings(Output.toString());
    if (propOutBindings) {
        let template = ctx.template;
        await Promise.all(Array.from(propOutBindings.keys()).map(async n => {
            let binding = propOutBindings.get(n);
            let filed = binding.bindingName || binding.name;
            let expression = template ? template[filed] : null;
            if (!isNullOrUndefined(expression)) {
                let pctx = ParseContext.parse(ctx.injector, {
                    type: ctx.type,
                    parent: ctx,
                    bindExpression: expression,
                    binding: binding
                });
                await BindingScopeHandle(pctx);
                pctx.dataBinding.bind(ctx.value);
            }
        }));
    }

    await next();
};
