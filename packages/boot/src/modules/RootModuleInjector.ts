import { Singleton, Type } from '@ts-ioc/ioc';
import { ModuleInjector, IContainer } from '@ts-ioc/core';
import { ContainerPool } from 'packages/bootstrap/src/ContainerPool';


@Singleton
export class RootModuleInjector extends ModuleInjector {
    getDecorator(): string {
        return '@RootModule';
    }

    protected async setup(container: IContainer, type: Type<any>) {
        container.get(ContainerPool).getRoot().register(type);
    }

    protected syncSetup(container: IContainer, type: Type<any>) {
        container.get(ContainerPool).getRoot().register(type);
    }
}
