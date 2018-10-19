import { IContainer } from './IContainer';
import { Injectable, Component, AutoWired, Inject, Singleton, Param, Method, Abstract, Autorun, IocExt } from './core/decorators';
import { CoreActions } from './core/actions';
import { DefaultLifeScope } from './core/DefaultLifeScope';
import { LifeScopeToken } from './LifeScope';
import { MethodAccessor } from './core/MethodAccessor';
import { CacheManager, ProviderMap, ProviderMapToken, ProviderParser, ProviderParserToken } from './core';
import { CacheManagerToken } from './ICacheManager';
import { MethodAccessorToken } from './IMethodAccessor';
import { ResolverChain, ResolverChainToken } from './resolves';

/**
 * register core for container.
 *
 * @export
 * @param {IContainer} container
 */
export function registerCores(container: IContainer) {

    container.registerSingleton(LifeScopeToken, () => new DefaultLifeScope(container));
    container.registerSingleton(CacheManagerToken, () => new CacheManager(container));
    container.registerSingleton(ResolverChainToken, () => new ResolverChain(container));
    container.register(ProviderMapToken, () => new ProviderMap(container));
    container.bindProvider(ProviderMap, ProviderMapToken);
    container.registerSingleton(ProviderParserToken, () => new ProviderParser(container));
    container.registerSingleton(MethodAccessorToken, () => new MethodAccessor(container));

    let lifeScope = container.get(LifeScopeToken);

    lifeScope.registerDecorator(Injectable, CoreActions.bindProvider, CoreActions.cache);
    lifeScope.registerDecorator(Component, CoreActions.bindProvider, CoreActions.cache, CoreActions.componentBeforeInit, CoreActions.componentInit, CoreActions.componentAfterInit);
    lifeScope.registerDecorator(Singleton, CoreActions.bindProvider);
    lifeScope.registerDecorator(Abstract, CoreActions.bindProvider, CoreActions.cache);
    lifeScope.registerDecorator(AutoWired, CoreActions.bindParameterType, CoreActions.bindPropertyType);
    lifeScope.registerDecorator(Inject, CoreActions.bindParameterType, CoreActions.bindPropertyType);
    lifeScope.registerDecorator(Param, CoreActions.bindParameterType, CoreActions.bindPropertyType);
    lifeScope.registerDecorator(Method, CoreActions.bindParameterProviders);

    lifeScope.registerDecorator(Autorun, CoreActions.autorun, CoreActions.methodAutorun);
    lifeScope.registerDecorator(IocExt, CoreActions.autorun, CoreActions.componentBeforeInit, CoreActions.componentInit, CoreActions.componentAfterInit);

    container.register(Date, () => new Date());
    container.register(String, () => '');
    container.register(Number, () => Number.NaN);
    container.register(Boolean, () => undefined);
    container.register(Array, () => []);

}
