import {
    Type, Token, Factory, SymbolType, Modules, LoadType
} from './types';
import { IMethodAccessor } from './services/MethodAccessor';
import { InjectToken } from './InjectToken';
import { IContainerBuilder } from './IContainerBuilder';
import { IResolverContainer } from './IResolver';
import { ParamProviders, ProviderTypes } from './providers';
import { IParameter } from './IParameter';

/**
 * IContainer token.
 * it is a symbol id, you can use  @Inject, @Autowried or @Param to get container instance in yourself class.
 */
export const ContainerToken = new InjectToken<IContainer>('DI_IContainer');

/**
 * container interface.
 *
 * @export
 * @interface IContainer
 */
export interface IContainer extends IResolverContainer {

    /**
     * get container builder of this container.
     *
     * @returns {IContainerBuilder}
     * @memberof IContainer
     */
    getBuilder(): IContainerBuilder;

    /**
     * current container has register.
     *
     * @template T
     * @param {Token<T>} key
     * @returns {boolean}
     * @memberof IContainer
     */
    hasRegister<T>(key: Token<T>): boolean;

    /**
     * Retrieves an instance from the container based on the provided token.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    get<T>(token: Token<T>, alias?: string, ...providers: ParamProviders[]): T;

    /**
     * register type.
     *
     * @template T
     * @param {Token<T>} token
     * @param {Factory<T>} [value]
     * @returns {this}
     * @memberof IContainer
     */
    register<T>(token: Token<T>, value?: Factory<T>): this;

    /**
     * register stingleton type.
     *
     * @template T
     * @param {Token<T>} token
     * @param {Factory<T>} value
     * @returns {this}
     * @memberOf IContainer
     */
    registerSingleton<T>(token: Token<T>, value?: Factory<T>): this;

    /**
     * register value.
     *
     * @template T
     * @param {Token<T>} token
     * @param {T} value
     * @returns {this}
     * @memberof IContainer
     */
    registerValue<T>(token: Token<T>, value: T): this;

    /**
     * unregister value.
     *
     * @template T
     * @param {Token<T>} token
     * @returns {this}
     * @memberof IContainer
     */
    unregisterValue<T>(token: Token<T>): this;

    /**
     * bind provider
     *
     * @template T
     * @param {Token<T>} provide
     * @param {Token<T> | Factory<T>} provider
     * @returns {this}
     * @memberof IContainer
     */
    bindProvider<T>(provide: Token<T>, provider: Token<T> | Factory<T>): this;

    /**
     * bind providers.
     *
     * @param {...ProviderTypes[]} providers
     * @returns {this}
     * @memberof IContainer
     */
    bindProviders(...providers: ProviderTypes[]): this;

    /**
     * bind providers for only target class.
     *
     * @param {Token<any>} target
     * @param {...ProviderTypes[]} providers
     * @returns {this}
     * @memberof IContainer
     */
    bindProviders<T>(target: Token<T>, ...providers: ProviderTypes[]): this;

    /**
     * bind providers for only target class.
     *
     * @param {Token<any>} target
     * @param {(mapTokenKey: Token<any>) => void} onceBinded
     * @param {...ProviderTypes[]} providers
     * @returns {this}
     * @memberof IContainer
     */
    bindProviders<T>(target: Token<T>, onceBinded: (mapTokenKey: Token<any>) => void, ...providers: ProviderTypes[]): this;

    /**
     * bind provider ref to target.
     *
     * @template T
     * @param {Token<any>} target
     * @param {Token<T>} provide
     * @param {(Token<T> | Factory<T>)} provider
     * @param {string} [alias]
     * @param {(refToken: Token<T>) => void} [onceBinded]
     * @returns {this}
     * @memberof IContainer
     */
    bindRefProvider<T>(target: Token<any>, provide: Token<T>, provider: Token<T> | Factory<T>, alias?: string, onceBinded?: (refToken: Token<T>) => void): this;

    /**
     * clear cache.
     *
     * @param {Type<any>} targetType
     * @memberof IContainer
     */
    clearCache(targetType: Type<any>);

    /**
     * get token.
     *
     * @template T
     * @param {Token<T>} target
     * @param {string} [alias]
     * @returns {Token<T>}
     * @memberof IContainer
     */
    getToken<T>(target: Token<T>, alias?: string): Token<T>;

    /**
     * get tocken key.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @returns {SymbolType<T>}
     * @memberof IContainer
     */
    getTokenKey<T>(token: Token<T>, alias?: string): SymbolType<T>;

    /**
     * get token provider.
     *
     * @template T
     * @param {Token<T>} token
     * @returns {Type<T>}
     * @memberof IContainer
     */
    getTokenProvider<T>(token: Token<T>): Type<T>;

    /**
     * use modules.
     *
     * @param {...Modules[]} modules
     * @returns {this}
     * @memberof IContainer
     */
    use(...modules: Modules[]): this;

    /**
     * load modules.
     *
     * @param {...LoadType[]} modules load modules.
     * @returns {Promise<Type<any>[]>}  types loaded.
     * @memberof IContainer
     */
    loadModule(...modules: LoadType[]): Promise<Type<any>[]>;


    
    /**
     * try to async invoke the method of intance, if no instance will create by type.
     *
     * @template T
     * @param {*} target
     * @param {string} propertyKey
     * @param {...ParamProviders[]} providers
     * @returns {Promise<T>}
     * @memberof IMethodAccessor
     */
    invoke<T>(target: any, propertyKey: string, ...providers: ParamProviders[]): Promise<T>;

    /**
     * try to async invoke the method of intance, if no instance will create by type.
     *
     * @template T
     * @param {Token<any>} target
     * @param {string} propertyKey
     * @param {...ParamProviders[]} providers
     * @returns {Promise<T>}
     * @memberof IMethodAccessor
     */
    invoke<T>(target: Token<any>, propertyKey: string, ...providers: ParamProviders[]): Promise<T>;

    /**
     * try to async invoke the method of intance, if no instance will create by type.
     *
     * @template T
     * @param {Token<any>} target
     * @param {string} propertyKey
     * @param {*} instance
     * @param {...ParamProviders[]} providers
     * @returns {Promise<T>}
     * @memberof IMethodAccessor
     */
    invoke<T>(target: Token<any>, propertyKey: string, instance: any, ...providers: ParamProviders[]): Promise<T>;

    /**
     * try to invoke the method of intance, if is token will create instance to invoke.
     *
     * @template T
     * @param {*} target
     * @param {string} propertyKey
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IMethodAccessor
     */
    syncInvoke<T>(target: any, propertyKey: string, ...providers: ParamProviders[]): T;
    /**
     * try create instance to invoke property method.
     *
     * @template T
     * @param {*} target
     * @param {string} propertyKey
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IMethodAccessor
     */
    syncInvoke<T>(target: any, propertyKey: string, ...providers: ParamProviders[]): T;

    /**
     * try to invoke the method of intance, if is token will create instance to invoke.
     *
     * @template T
     * @param {*} target
     * @param {string} propertyKey
     * @param {*} instance
     * @param {...ParamProviders[]} providers
     * @memberof IMethodAccessor
     */
    syncInvoke<T>(target: any, propertyKey: string, instance: any, ...providers: ParamProviders[])

    /**
     * create params instances with IParameter and provider.
     *
     * @param {IParameter[]} params
     * @param {...ParamProvider[]} providers
     * @returns {any[]}
     * @memberof IMethodAccessor
     */
    createSyncParams(params: IParameter[], ...providers: ParamProviders[]): any[];

    /**
     * create params instances with IParameter and provider
     *
     * @param {IParameter[]} params
     * @param {...AsyncParamProvider[]} providers
     * @returns {Promise<any[]>}
     * @memberof IMethodAccessor
     */
    createParams(params: IParameter[], ...providers: ParamProviders[]): Promise<any[]>;

}
