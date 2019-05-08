import { IContainer, ContainerToken, IocExt, ModuleDecoratorRegisterer, ServiceDecoratorRegisterer } from '@tsdi/core';
import { Task } from './decorators/Task';
import { RunAspect } from './aop';
import * as core from './core';
import * as activites from './activities';
import { Inject, BindProviderAction, DesignDecoratorRegisterer, DecoratorScopes, ActionRegisterer } from '@tsdi/ioc';
import { ModuleBuildDecoratorRegisterer, DIModuleRegisterScope, RegSelectorAction, BindingScope, SelectorDecoratorRegisterer, HandleRegisterer } from '@tsdi/boot';
import { TaskDecoratorServiceAction } from './core';
import { TaskDecorBootBuildHandle, TaskDecorSelectorHandle } from './handles';



/**
 * register task decorators.
 *
 * @export
 * @param {IContainer} container
 */
@IocExt('setup')
export class CoreModule {
    constructor(@Inject(ContainerToken) private container: IContainer) {
    }

    setup() {
        let container = this.container;

        container.get(ActionRegisterer)
            .register(container, TaskDecoratorServiceAction);

        container.get(HandleRegisterer)
            .register(container, TaskDecorBootBuildHandle)
            .register(container, TaskDecorSelectorHandle);


        container.get(DesignDecoratorRegisterer).register(Task, DecoratorScopes.Class,
            BindProviderAction, RegSelectorAction);


        container.get(ModuleDecoratorRegisterer).register(Task, DIModuleRegisterScope);
        container.get(ModuleBuildDecoratorRegisterer).register(Task, BindingScope);
        container.get(SelectorDecoratorRegisterer).register(Task, TaskDecorSelectorHandle);

        container.use(core)
            .use(RunAspect)
            .use(activites);

        container.get(ServiceDecoratorRegisterer).register(Task, TaskDecoratorServiceAction);
    }
}
