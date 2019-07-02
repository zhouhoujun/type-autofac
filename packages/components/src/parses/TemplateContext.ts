import { IContainer } from '@tsdi/core';
import { ContainerFactory, Injectable, Type, ProviderTypes, InjectToken, IocRaiseContext } from '@tsdi/ioc';
import { IModuleResolveOption, IComponentContext, ModuleConfigure } from '@tsdi/boot';

export interface ITemplateOption extends IModuleResolveOption {
    selector?: Type;
}

/**
 * Template option token.
 */
export const TemplateOptionToken = new InjectToken<ITemplateOption>('Component_TemplateOption');

@Injectable
export class TemplateContext extends IocRaiseContext implements IComponentContext {

    selector?: Type;

    scope?: any;

    value?: any;

    template?: any;

    decorator?: string;

    /**
     * annoation metadata config.
     *
     * @type {IAnnotationMetadata}
     * @memberof BuildContext
     */
    annoation?: ModuleConfigure;
    /**
    * providers.
    *
    * @type {ProviderTypes[]}
    * @memberof BootOptions
    */
    providers?: ProviderTypes[];

    getRaiseContainer(): IContainer {
        return this.raiseContainer() as IContainer;
    }

    static parse(options: ITemplateOption, raiseContainer?: IContainer | ContainerFactory): TemplateContext {
        let ctx = new TemplateContext();
        ctx.setOptions(options);
        ctx.providers = ctx.providers || [];
        ctx.providers.push({ provide: TemplateOptionToken, useValue: options });
        raiseContainer && ctx.setRaiseContainer(raiseContainer);
        return ctx;
    }
}
