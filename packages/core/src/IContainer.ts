import { Type, Token, Factory, SymbolType, Modules, LoadType, ReferenceToken, RefTokenFac } from './types';
import { IMethodAccessor } from './IMethodAccessor';
import { LifeScope } from './LifeScope';
import { InjectToken } from './InjectToken';
import { IContainerBuilder } from './IContainerBuilder';
import { IResolver } from './IResolver';
import { ResolverChain } from './resolves';
import { ParamProviders } from './providers';

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
export interface IContainer extends IMethodAccessor, IResolver {
    /**
     * get or set parent container.
     *
     * @type {IContainer}
     * @memberof IContainer
     */
    parent: IContainer;

    /**
     * get root container.
     *
     * @returns {IContainer}
     * @memberof IContainer
     */
    getRoot(): IContainer;

    /**
     * resolve chain.
     *
     * @type {ResolverChain}
     * @memberof IContainer
     */
    getResolvers(): ResolverChain;

    /**
     * get container builder of this container.
     *
     * @returns {IContainerBuilder}
     * @memberof IContainer
     */
    getBuilder(): IContainerBuilder;

    /**
     * has register the token or not.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @returns {boolean}
     * @memberof IContainer
     */
    has<T>(token: Token<T>, alias?: string): boolean;

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
     * resolve token value in this container only.
     *
     * @template T
     * @param {Token<T>} token
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    resolveValue<T>(token: Token<T>, ...providers: ParamProviders[]): T;

    /**
     * resolve first token when not null.
     *
     * @template T
     * @param {Token<any>[]} tokens
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    resolveFirst<T>(tokens: Token<any>[], ...providers: ParamProviders[]): T;

    /**
     * get service or target reference service.
     *
     * @template T
     * @param {(Token<T> | Token<any>[])} token servive token.
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    getService<T>(token: Token<T> | Token<any>[], ...providers: ParamProviders[]): T;

    /**
     * get service or target reference service.
     *
     * @template T
     * @param {(Token<T> | Token<any>[])} token servive token.
     * @param {(Token<any> | Token<any>[])} [target] service refrence target.
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    getService<T>(token: Token<T> | Token<any>[], target: Token<any> | Token<any>[], ...providers: ParamProviders[]): T;

    /**
     * get service or target reference service.
     *
     * @template T
     * @param {(Token<T> | Token<any>[])} token servive token.
     * @param {(Token<any> | Token<any>[])} [target] service refrence target.
     * @param {RefTokenFac<T>} toRefToken
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    getService<T>(token: Token<T> | Token<any>[], target: Token<any> | Token<any>[], toRefToken: RefTokenFac<T>, ...providers: ParamProviders[]): T;

    /**
     * get service or target reference service.
     *
     * @template T
     * @param {(Token<T> | Token<any>[])} token servive token.
     * @param {(Token<any> | Token<any>[])} [target] service refrence target.
     * @param {(boolean | Token<T>)} defaultToken
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    getService<T>(token: Token<T> | Token<any>[], target: Token<any> | Token<any>[], defaultToken: boolean | Token<T>, ...providers: ParamProviders[]): T;

    /**
     * get service or target reference service.
     *
     * @template T
     * @param {(Token<T> | Token<any>[])} token servive token.
     * @param {(Token<any> | Token<any>[])} [target] service refrence target.
     * @param {RefTokenFac<T>} toRefToken
     * @param {(boolean | Token<T>)} defaultToken
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    getService<T>(token: Token<T> | Token<any>[], target: Token<any> | Token<any>[], toRefToken: RefTokenFac<T>, defaultToken: boolean | Token<T>, ...providers: ParamProviders[]): T;

    /**
     * get target reference service.
     *
     * @template T
     * @param {ReferenceToken<T>} [refToken] reference service Registration Injector
     * @param {(Token<any> | Token<any>[])} target  the service reference to.
     * @param {Token<T>} [defaultToken] default service token.
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    getRefService<T>(refToken: ReferenceToken<T>, target: Token<any> | Token<any>[], defaultToken?: Token<T>| Token<any>[], ...providers: ParamProviders[]): T

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
     * bind providers for only target class.
     *
     * @param {Token<any>} target
     * @param {ParamProviders[]} providers
     * @param {(mapTokenKey: Token<any>) => void} [onceBinded]
     * @returns {this}
     * @memberof IContainer
     */
    bindTarget(target: Token<any>, providers: ParamProviders[], onceBinded?: (mapTokenKey: Token<any>) => void): this;

    /**
     * unregister the token
     *
     * @template T
     * @param {Token<T>} token
     * @returns {this}
     * @memberof IContainer
     */
    unregister<T>(token: Token<T>, inchain?: boolean): this;

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
     * get token implement class type.
     *
     * @template T
     * @param {Token<T>} token
     * @param {boolean} inchain
     * @returns {Type<T>}
     * @memberof IContainer
     */
    getTokenImpl<T>(token: Token<T>, inchain?: boolean): Type<T>;

    /**
     * iterate token  in  token class chain.  return false will break iterate.
     *
     * @param {Token<any>} token
     * @param {(token: Token<any>, classProviders?: Token<any>[]) => boolean} express
     * @memberof IContainer
     */
    forInTokenClassChain(token: Token<any>, express: (token: Token<any>, classProviders?: Token<any>[]) => boolean): void;

    /**
     * get token implement class and base classes.
     *
     * @param {Token<any>} token
     * @param {boolean} [chain] get all base classes or only impletment class. default true.
     * @returns {Token<any>[]}
     * @memberof IContainer
     */
    getTokenClassChain(token: Token<any>, chain?: boolean): Token<any>[];

    /**
     * get life scope of container.
     *
     * @returns {LifeScope}
     * @memberof IContainer
     */
    getLifeScope(): LifeScope;

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
}
