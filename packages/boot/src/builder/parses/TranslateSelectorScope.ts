import { TemplatesHandle, TemplateHandle } from './TemplateHandle';
import { TemplateContext } from './TemplateContext';
import { Singleton, Type } from '@tsdi/ioc';
import { IocASyncDecoratorRegisterer } from '../../core';


export class TranslateSelectorScope extends TemplatesHandle {
    async execute(ctx: TemplateContext, next?: () => Promise<void>): Promise<void> {
        await super.execute(ctx);
        if (next) {
            await next();
        }
    }
    setup() {
        this.container.register(ElementDecoratorRegisterer);

        this.use(TranslateElementHandle);
    }
}


@Singleton
export class ElementDecoratorRegisterer extends IocASyncDecoratorRegisterer<Type<TemplateHandle>> {

}
export class TranslateElementHandle extends TemplateHandle {
    async execute(ctx: TemplateContext, next: () => Promise<void>): Promise<void> {
        let reg = this.container.get(ElementDecoratorRegisterer);
        if (reg.has(ctx.decorator)) {
            await this.execFuncs(ctx, reg.getFuncs(this.container, ctx.decorator));
        }

        if (!ctx.selector) {
            await next();
        }
    }
}

