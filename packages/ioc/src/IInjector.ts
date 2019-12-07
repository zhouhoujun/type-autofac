import { ProviderTypes, InjectTypes } from './providers/types';
import { Token, InstanceFactory, SymbolType, Factory, Type } from './types';

/**
 * resolver.
 *
 * @export
 * @interface IResolver
 */
export interface IInjector {
    /**
     * resolver size.
     *
     * @type {number}
     * @memberof IResolverContainer
     */
    readonly size: number;
    /**
     * has token key.
     *
     * @template T
     * @param {SymbolType<T>} key
     * @returns {boolean}
     * @memberof IInjector
     */
    hasTokenKey<T>(key: SymbolType<T>): boolean;
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
     * has register.
     *
     * @template T
     * @param {Token<T>} key
     * @returns {boolean}
     * @memberof IResolver
     */
    has<T>(key: Token<T>): boolean;

    /**
     *  has register.
     *
     * @template T
     * @param {Token<T>} key
     * @param {string} alias
     * @returns {boolean}
     * @memberof IResolver
     */
    has<T>(key: Token<T>, alias: string): boolean;

    /**
     * get token factory resolve instace in current container.
     *
     * @template T
     * @param {Token<T>} token
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IIocContainer
     */
    get<T>(token: Token<T>, ...providers: ProviderTypes[]): T;

    /**
     * get token factory resolve instace in current container.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} alias
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    get<T>(token: Token<T>, alias: string, ...providers: ProviderTypes[]): T;

    /**
     * get instance
     *
     * @template T
     * @param {SymbolType<T>} key
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IResolver
     */
    getInstance<T>(key: SymbolType<T>, ...providers: ProviderTypes[]): T;
     /**
     * get token implement class type.
     *
     * @template T
     * @param {Token<T>} token
     * @param {ResoveWay} [resway]
     * @returns {Type<T>}
     * @memberof IResolver
     */
    getTokenProvider<T>(token: Token<T>): Type<T>;

    /**
     * set provide.
     *
     * @template T
     * @param {SymbolType<T>} provide
     * @param {InstanceFactory<T>} fac
     * @param {Type<T>} [providerType]
     * @returns {this}
     * @memberof IInjector
     */
    set<T>(provide: SymbolType<T>, fac: InstanceFactory<T>, providerType?: Type<T>): this;
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
     * inject providers.
     *
     * @param {...InjectTypes[]} providers
     * @returns {this}
     * @memberof IInjector
     */
    inject(...providers: InjectTypes[]): this;
    /**
     * unregister the token
     *
     * @template T
     * @param {Token<T>} token
     * @returns {this}
     * @memberof IResolver
     */
    unregister<T>(token: Token<T>): this;

    /**
     * iterator current resolver.
     *
     * @param {((fac: InstanceFactory, tk: Token, resolvor?: IInjector) => void|boolean)} callbackfn
     * @returns {(void|boolean)}
     * @memberof IResolverContainer
     */
    iterator(callbackfn: (fac: InstanceFactory, tk: Token, resolvor?: IInjector) => void | boolean): void | boolean;

    /**
     * copy injector.
     *
     * @param {IInjector} injector
     * @returns {this}
     * @memberof IInjector
     */
    copy(injector: IInjector): this;

    /**
     * clone this injector to.
     *
     * @param {IInjector} [to] clone to.
     * @returns {IInjector}
     * @memberof IInjector
     */
    clone(to?: IInjector): IInjector
}

