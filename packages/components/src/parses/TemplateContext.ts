import { ContainerFactory, Injectable, Type, InjectToken, createRaiseContext, CTX_PROVIDERS } from '@tsdi/ioc';
import { IContainer } from '@tsdi/core';
import { IComponentContext, AnnoationContext } from '@tsdi/boot';
import { ITemplateOption } from '../IComponentBuilder';


/**
 * Template option token.
 */
export const TemplateOptionToken = new InjectToken<ITemplateOption>('Component_TemplateOption');

/**
 * template context.
 *
 * @export
 * @class TemplateContext
 * @extends {IocRaiseContext<IContainer>}
 * @implements {IComponentContext}
 */
@Injectable
export class TemplateContext extends AnnoationContext<ITemplateOption> implements IComponentContext {

    selector?: Type;

    value?: any;

    static parse(options: ITemplateOption, raiseContainer?: ContainerFactory<IContainer>): TemplateContext {
        let ctx = createRaiseContext(TemplateContext, options, raiseContainer);
        ctx.set(CTX_PROVIDERS, [...ctx.providers, { provide: TemplateOptionToken, useValue: ctx.getOptions() }]);
        return ctx;
    }
}
