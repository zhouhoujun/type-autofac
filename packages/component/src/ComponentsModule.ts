import {
    Inject, DecoratorProvider, DesignRegisterer, IocExt, DecoratorScope
} from '@tsdi/ioc';
import { IContainer, ContainerToken } from '@tsdi/core';
import { ResolveMoudleScope, BuildContext } from '@tsdi/boot';
import { Component, Directive, Pipe } from './decorators';


import { PipeRegAction } from './registers/PipeRegAction';
import { ComponentContext } from './ComponentContext';
import { DirectiveDefAction } from './registers/DirectiveDefAction';
import { ComponentDefAction } from './registers/ComponentDefAction';
import { ParseTemplateHandle } from './compile/actions';
import { Identifiers } from './compile/facade';


/**
 * component extend module.
 *
 * @export
 * @class ComponentModule
 */
@IocExt()
export class ComponentsModule {

    setup(@Inject(ContainerToken) container: IContainer) {
        let actInjector = container.getActionInjector();
        actInjector.getInstance(DecoratorProvider)
            .bindProviders(Component,
                { provide: BuildContext, useClass: ComponentContext },
                { provide: Identifiers, useValue: new Identifiers(container.getProxy())}
            );

        actInjector.getInstance(ResolveMoudleScope)
            .use(ParseTemplateHandle);


        const cls: DecoratorScope = 'Class';

        actInjector.getInstance(DesignRegisterer)
            .register(Component, cls, ComponentDefAction)
            .register(Directive, cls, DirectiveDefAction)
            .register(Pipe, cls, PipeRegAction);

    }

}