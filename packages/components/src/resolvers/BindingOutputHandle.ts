import { isNullOrUndefined } from '@tsdi/ioc';
import { ParseContext } from '../parses/ParseContext';
import { BindingScopeHandle } from '../parses/BindingValueScope';
import { Output } from '../decorators/Output';
import { IComponentContext } from '../ComponentContext';


export const BindingOutputHandle = async function (ctx: IComponentContext, next: () => Promise<void>): Promise<void> {

    let refl = ctx.targetReflect;
    let propOutBindings = refl?.getBindings(Output.toString());
    if (propOutBindings) {
        let bindings = ctx.template;
        await Promise.all(Array.from(propOutBindings.keys()).map(async n => {
            let binding = propOutBindings.get(n);
            let filed = binding.bindingName || binding.name;
            let expression = bindings ? bindings[filed] : null;
            if (!isNullOrUndefined(expression)) {
                let pctx = ParseContext.parse(ctx.injector, {
                    type: ctx.type,
                    parent: ctx,
                    scope: ctx.scope,
                    bindExpression: expression,
                    binding: binding
                });
                await BindingScopeHandle(pctx);
                pctx.dataBinding.bind(ctx.value);
                pctx.destroy();
            }
        }));
    }

    await next();
};
