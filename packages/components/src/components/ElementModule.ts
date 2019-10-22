import { IocExt, ContainerToken, IContainer } from '@tsdi/core';
import { Inject, DecoratorProvider } from '@tsdi/ioc';
import { HandleRegisterer, StartupDecoratorRegisterer, StartupScopes } from '@tsdi/boot';
import { Component } from '../decorators';
import { ElementNode } from './ElementNode';
import { RefSelector } from '../RefSelector';
import { RefElementSelector } from './RefElementSelector';
import { ComponentSelectorHandle, ValidComponentHandle, BindingComponentHandle } from './handles';

/**
 * component element module.
 *
 * @export
 * @class ElementModule
 */
@IocExt('setup')
export class ElementModule {

    constructor() {

    }

    setup(@Inject(ContainerToken) container: IContainer) {
        container.register(RefElementSelector);
        container.getInstance(StartupDecoratorRegisterer)
            .register(Component, StartupScopes.TranslateTemplate, ComponentSelectorHandle)
            .register(Component, StartupScopes.ValifyComponent, ValidComponentHandle)
            .register(Component, StartupScopes.Binding, BindingComponentHandle);

        container.getInstance(HandleRegisterer)
            .register(container, ComponentSelectorHandle)
            .register(container, ValidComponentHandle)
            .register(container, BindingComponentHandle);

        container.getInstance(DecoratorProvider)
            .bindProviders(Component, { provide: RefSelector, useClass: RefElementSelector })

        container.register(ElementNode);
    }
}
