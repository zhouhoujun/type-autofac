import { isNullOrUndefined } from '@tsdi/ioc';
import { HandleRegisterer, ResolveHandle, BuildContext } from '@tsdi/boot';
import { ViewRef } from '../ComponentRef';
import { TemplateContext } from '../parses/TemplateContext';
import { TemplateParseScope } from '../parses/TemplateParseScope';


export class ResolveTemplateScope extends ResolveHandle {
    async execute(ctx: BuildContext, next: () => Promise<void>): Promise<void> {
        let options = ctx.getOptions();
        if (!options.scope && !options.parsing && options.template && !ctx.annoation.template) {
            ctx.annoation.template = options.template;
        }
        if (ctx.target && ctx.annoation.template) {
            let pCtx = TemplateContext.parse({
                scope: ctx.target,
                template: ctx.annoation.template,
                annoation: ctx.annoation,
                decorator: ctx.decorator,
                raiseContainer: ctx.getFactory()
            });
            await this.container.getInstance(HandleRegisterer)
                .get(TemplateParseScope)
                .execute(pCtx);
            if (!isNullOrUndefined(pCtx.value)) {
                ctx.set(ViewRef, pCtx.value);
            }
        }
        await next();
    }
}