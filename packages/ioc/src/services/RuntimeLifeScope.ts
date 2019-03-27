import { ParamProviders } from '../providers';
import { Type } from '../types';
import {
    IocGetCacheAction, RuntimeMethodScope, BindParameterTypeAction,
    ComponentBeforeInitAction, ComponentInitAction,
    ComponentAfterInitAction, RegisterSingletionAction, InjectPropertyAction,
    GetSingletionAction, ContainerCheckerAction, IocSetCacheAction,
    CreateInstanceAction, ConstructorArgsAction, MethodAutorunAction, RuntimeActionContext,
    IocBeforeConstructorScope, IocAfterConstructorScope, InstanceCheckAction,
    RuntimeAnnoationScope, RuntimePropertyScope, InitReflectAction, RuntimeParamScope,
    RuntimeDecoratorAction, BindDeignParamTypeAction
} from '../actions';
import { IIocContainer } from '../IIocContainer';
import { IParameter } from '../IParameter';
import { RuntimeDecoratorRegisterer } from './DecoratorRegisterer';
import { Inject, AutoWired, Param, Autorun, Component, Injectable, Singleton } from '../decorators';
import { RegisterLifeScope } from './RegisterLifeScope';
import { DecoratorType } from '../factories';

/**
 * runtime life scope.
 *
 * @export
 * @class RuntimeLifeScope
 * @extends {LifeScope}
 */
export class RuntimeLifeScope extends RegisterLifeScope<RuntimeActionContext> {

    getParamProviders(container: IIocContainer, type: Type<any>, propertyKey: string, target?: any): ParamProviders[] {
        let tgRefl = container.getTypeReflects().get(type);
        if (tgRefl && tgRefl.methodParamProviders.has(propertyKey)) {
            return tgRefl.methodParamProviders.get(propertyKey) || [];
        }
        return [];
    }

    /**
     * get constructor parameters metadata.
     *
     * @template T
     * @param {Type<T>} type
     * @returns {IParameter[]}
     * @memberof IContainer
     */
    getConstructorParameters<T>(container: IIocContainer, type: Type<T>): IParameter[] {
        return this.getParameters(container, type);
    }

    /**
     * get method params metadata.
     *
     * @template T
     * @param {Type<T>} type
     * @param {T} instance
     * @param {(string | symbol)} propertyKey
     * @returns {IParameter[]}
     * @memberof IContainer
     */
    getMethodParameters<T>(container: IIocContainer, type: Type<T>, instance: T, propertyKey: string): IParameter[] {
        return this.getParameters(container, type, instance, propertyKey);
    }

    setup(container: IIocContainer) {
        container.registerSingleton(RuntimeDecoratorRegisterer, () => new RuntimeDecoratorRegisterer());

        if (!container.has(InitReflectAction)) {
            container.registerSingleton(InitReflectAction, () => new InitReflectAction(container));
        }

        container.registerSingleton(BindDeignParamTypeAction, () => new BindDeignParamTypeAction(container));
        container.registerSingleton(BindParameterTypeAction, () => new BindParameterTypeAction(container));
        container.registerSingleton(ComponentBeforeInitAction, () => new ComponentBeforeInitAction(container));
        container.registerSingleton(ComponentInitAction, () => new ComponentInitAction(container));
        container.registerSingleton(ComponentAfterInitAction, () => new ComponentAfterInitAction(container));
        container.registerSingleton(ConstructorArgsAction, () => new ConstructorArgsAction(container));
        container.registerSingleton(ContainerCheckerAction, () => new ContainerCheckerAction(container));
        container.registerSingleton(CreateInstanceAction, () => new CreateInstanceAction(container));
        container.registerSingleton(GetSingletionAction, () => new GetSingletionAction(container));

        container.registerSingleton(InjectPropertyAction, () => new InjectPropertyAction(container));
        container.registerSingleton(InstanceCheckAction, () => new InstanceCheckAction(container));
        container.registerSingleton(RegisterSingletionAction, () => new RegisterSingletionAction(container));
        container.registerSingleton(IocGetCacheAction, () => new IocGetCacheAction(container));
        container.registerSingleton(IocSetCacheAction, () => new IocSetCacheAction(container));
        container.registerSingleton(MethodAutorunAction, () => new MethodAutorunAction(container));


        container.registerSingleton(IocBeforeConstructorScope, () => new IocBeforeConstructorScope(container));
        container.registerSingleton(IocAfterConstructorScope, () => new IocAfterConstructorScope(container));

        container.registerSingleton(RuntimeDecoratorAction, () => new RuntimeDecoratorAction(container));
        container.registerSingleton(RuntimeAnnoationScope, () => new RuntimeAnnoationScope(container));
        container.registerSingleton(RuntimePropertyScope, () => new RuntimePropertyScope(container));
        container.registerSingleton(RuntimeMethodScope, () => new RuntimeMethodScope(container));
        container.registerSingleton(RuntimeParamScope, () => new RuntimeParamScope(container));

        let decRgr = container.get(RuntimeDecoratorRegisterer);

        decRgr.register(Inject, DecoratorType.Property, InjectPropertyAction);
        decRgr.register(AutoWired, DecoratorType.Property, InjectPropertyAction);

        decRgr.register(Inject, DecoratorType.Parameter, BindParameterTypeAction);
        decRgr.register(AutoWired, DecoratorType.Parameter, BindParameterTypeAction);
        decRgr.register(Param, DecoratorType.Parameter, BindParameterTypeAction);

        decRgr.register(Autorun, DecoratorType.Method, MethodAutorunAction);

        decRgr.register(Singleton, DecoratorType.Class, RegisterSingletionAction);
        decRgr.register(Injectable, DecoratorType.Class, RegisterSingletionAction, IocSetCacheAction);
        decRgr.register(Component, DecoratorType.Class, ComponentBeforeInitAction, ComponentInitAction, ComponentAfterInitAction,
            RegisterSingletionAction, IocSetCacheAction);


        container.get(RuntimeAnnoationScope).setup();
        container.get(RuntimePropertyScope).setup();
        container.get(RuntimeMethodScope).setup();
        container.get(RuntimeParamScope).setup();

        this.use(ContainerCheckerAction)
            .use(InitReflectAction)
            .use(GetSingletionAction)
            .use(IocGetCacheAction)
            .use(ConstructorArgsAction)
            .use(IocBeforeConstructorScope)
            .use(CreateInstanceAction)
            .use(IocAfterConstructorScope)
            .use(RuntimePropertyScope)
            .use(RuntimeMethodScope)
            .use(RuntimeAnnoationScope);

    }

    protected getParameters<T>(container: IIocContainer, type: Type<T>, instance?: T, propertyKey?: string): IParameter[] {
        propertyKey = propertyKey || 'constructor';
        let ctx = RuntimeActionContext.parse({
            targetType: type,
            target: instance,
            propertyKey: propertyKey
        }, container);
        this.execActions(ctx, [InitReflectAction, RuntimeParamScope, BindDeignParamTypeAction]);
        let params = ctx.targetReflect.methodParams.get(propertyKey);
        return params || [];
    }
}
