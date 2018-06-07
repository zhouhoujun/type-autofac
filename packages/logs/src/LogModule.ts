import { Inject, IContainer, LifeState, CoreActions, ContainerToken, LifeScopeToken, IocExt } from '@ts-ioc/core';
import { AopModule } from '@ts-ioc/aop';
import { Logger } from './decorators/Logger';
import { AnnotationLogerAspect } from './AnnotationLogerAspect';
import { ConsoleLogManager } from './ConsoleLogManager';
import { ConfigureLoggerManger } from './ConfigureLoggerManger';
import { LogFormater } from './LogFormater';

/**
 * aop logs ext for Ioc. auto run setup after registered.
 * with @IocExt('setup') decorator.
 * @export
 * @class LogModule
 */
@IocExt('setup')
export class LogModule {

    constructor(@Inject(ContainerToken) private container: IContainer) {

    }

    /**
     * register aop for container.
     *
     * @memberof AopModule
     */
    setup() {
        let container = this.container;
        if (!container.has(AopModule)) {
            container.register(AopModule);
        }
        let lifeScope = container.get(LifeScopeToken);
        lifeScope.registerDecorator(Logger, LifeState.onInit, CoreActions.bindParameterProviders);
        container.register(ConfigureLoggerManger);
        container.register(AnnotationLogerAspect);
        container.register(LogFormater);
        container.register(ConsoleLogManager);
    }
}
