import { Type, Token, Factory, SymbolType, Providers, Modules, LoadType } from './types';
import { IMethodAccessor } from './IMethodAccessor';
import { LifeScope } from './LifeScope';
import { InjectToken } from './InjectToken';
import { IContainerBuilder } from './IContainerBuilder';
import { IResolver } from './IResolver';
import { ResolverChain } from './resolves';
import { Registration } from './Registration';

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
     * parent container.
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
    readonly resolvers: ResolverChain;

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
     * current container has register.
     *
     * @template T
     * @param {SymbolType<T>} key
     * @memberof IContainer
     */
    hasRegister<T>(key: SymbolType<T>);

    /**
     * Retrieves an instance from the container based on the provided token.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @param {...Providers[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    get<T>(token: Token<T>, alias?: string, ...providers: Providers[]): T;

    /**
     * resolve token value in this container only.
     *
     * @template T
     * @param {Token<T>} token
     * @param {...Providers[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    resolveValue<T>(token: Token<T>, ...providers: Providers[]): T;

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
     * get target reference service.
     *
     * @template T
     * @param {Type<Registration<T>>} [refServiceInject] reference service Registration Injector
     * @param {Token<any>} target  the service reference to.
     * @param {Token<T>} [defaultToken] default service token.
     * @param {...Providers[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    getRefService<T>(refServiceInject: Type<Registration<T>>, target: Token<any>, defaultToken?: Token<T>, ...providers: Providers[]): T

    /**
     * get token implement class and base classes.
     *
     * @param {Token<any>} token
     * @returns {Token<any>[]}
     * @memberof IContainer
     */
    getTokenExtendsChain(token: Token<any>): Token<any>[];

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
     * unregister the token
     *
     * @template T
     * @param {Token<T>} token
     * @returns {this}
     * @memberof IContainer
     */
    unregister<T>(token: Token<T>, inchain?: boolean): this;

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
