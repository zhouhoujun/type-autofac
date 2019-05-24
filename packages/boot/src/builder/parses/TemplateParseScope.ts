import { TemplateHandle, TemplatesHandle } from './TemplateHandle';
import { TemplateContext } from './TemplateContext';
import { isNullOrUndefined, isArray } from '@tsdi/ioc';
import { ParseSelectorHandle } from './ParseSelectorHandle';
import { TranslateSelectorScope } from './TranslateSelectorScope';
import { BuildHandleRegisterer } from '../../core';


export class TemplateParseScope extends TemplatesHandle {
    async execute(ctx: TemplateContext, next?: () => Promise<void>): Promise<void> {
        await super.execute(ctx);
        if (isNullOrUndefined(ctx.value) && next) {
            await next();
        }
    }
    setup() {
        this.use(ElementsTemplateHandle)
            .use(TranslateSelectorScope, true)
            .use(ParseSelectorHandle);
    }
}


export class ElementsTemplateHandle extends TemplateHandle {

    async execute(ctx: TemplateContext, next: () => Promise<void>): Promise<void> {
        let registerer = this.container.get(BuildHandleRegisterer);
        if (isArray(ctx.template)) {
            ctx.value = await Promise.all(ctx.template.map(async tp => {
                let subCtx = TemplateContext.parse(ctx.type, {
                    scope: ctx.scope,
                    template: tp,
                    decorator: ctx.decorator,
                    annoation: ctx.annoation
                }, ctx.getRaiseContainer());
                await registerer.get(TemplateParseScope).execute(subCtx);
                return isNullOrUndefined(subCtx.value) ? tp : subCtx.value;
            }));
        }

        if (isNullOrUndefined(ctx.value)) {
            await next();
        }

    }
}

