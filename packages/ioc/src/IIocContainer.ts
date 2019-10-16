import { Type, Token, Factory, ClassType, SymbolType } from './types';
import { InjectToken } from './InjectToken';
import { IResolverContainer } from './IResolver';
import { ParamProviders, ProviderTypes } from './providers';
import { IParameter } from './IParameter';
import { TypeReflects } from './services';
import { ResolveActionContext, ResolveActionOption } from './actions';

/**
 * IContainer token.
 * it is a symbol id, you can use  `@Inject`, `@Autowried` or `@Param` to get container instance in yourself class.
 */
export const IocContainerToken = new InjectToken<IIocContainer>('DI_IocContainer');
/**
 *  container factory.
 */
export type ContainerFactory<T extends IIocContainer = IIocContainer> = () => T;
/**
 * container factory token.
 */
export const ContainerFactoryToken = new InjectToken<ContainerFactory>('DI_ContainerFactory');

/**
 * container interface.
 *
 * @export
 * @interface IIocContainer
 */
export interface IIocContainer extends IResolverContainer {

    /**
     * get container factory.
     *
     * @template T
     * @returns {ContainerFactory<T>}
     * @memberof IIocContainer
     */
    getFactory<T extends IIocContainer>(): ContainerFactory<T>;

    /**
     * get type reflects manager in current container.
     *
     * @returns {TypeReflects}
     * @memberof IIocContainer
     */
    getTypeReflects(): TypeReflects;

    /**
     * is token extends of base class type.
     *
     * @param {Token} token
     * @param {ClassType} base
     * @returns {boolean}
     * @memberof IIocContainer
     */
    isExtends(token: Token, base: ClassType): boolean;

    /**
     * get extends.
     *
     * @param {ClassType} type
     * @returns {ClassType[]}
     * @memberof IIocContainer
     */
    getExtends(type: ClassType): ClassType[];

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
     * get instace in current container.
     *
     * @template T
     * @param {SymbolType<T>} key
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IIocContainer
     */
    getInstance<T>(key: SymbolType<T>, ...providers: ProviderTypes[]): T

    /**
     * resolve instance with token and param provider.
     *
     * @template T
     * @param {Token<T>} token the token to resolve.
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IIocContainer
     */
    resolve<T>(token: Token<T>, ...providers: ProviderTypes[]): T;

    /**
     * resolve instance with token and param provider.
     *
     * @template T
     * @param {ResolveActionOption<T>} option  resolve option
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IIocContainer
     */
    resolve<T>(option: ResolveActionOption<T>, ...providers: ProviderTypes[]): T;

    /**
     * resolve instance with context.
     *
     * @template T
     * @param {ResolveActionContext<T>} context resolve context.
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IIocContainer
     */
    resolve<T>(context: ResolveActionContext<T>, ...providers: ProviderTypes[]): T;

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
     * @param {Token} target
     * @param {...ProviderTypes[]} providers
     * @returns {this}
     * @memberof IContainer
     */
    bindProviders<T>(target: Token<T>, ...providers: ProviderTypes[]): this;

    /**
     * bind providers for only target class.
     *
     * @param {Token} target
     * @param {(mapTokenKey: Token) => void} onceBinded
     * @param {...ProviderTypes[]} providers
     * @returns {this}
     * @memberof IContainer
     */
    bindProviders<T>(target: Token<T>, onceBinded: (mapTokenKey: Token) => void, ...providers: ProviderTypes[]): this;

    /**
     * bind provider ref to target.
     *
     * @template T
     * @param {Token} target
     * @param {Token<T>} provide
     * @param {(Token<T> | Factory<T>)} provider
     * @param {string} [alias]
     * @param {(refToken: Token<T>) => void} [onceBinded]
     * @returns {this}
     * @memberof IContainer
     */
    bindRefProvider<T>(target: Token, provide: Token<T>, provider: Token<T> | Factory<T>, alias?: string, onceBinded?: (refToken: Token<T>) => void): this;

    /**
     * clear cache.
     *
     * @param {Type} targetType
     * @memberof IContainer
     */
    clearCache(targetType: Type);

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
     * try to invoke the method of intance, if is token will create instance to invoke.
     *
     * @template T
     * @param {(Token<T> | T)} target type class
     * @param {(string | ((tag: T) => Function))} propertyKey
     * @param {...ParamProviders[]} providers
     * @returns {TR}
     * @memberof IMethodAccessor
     */
    invoke<T, TR = any>(target: Token<T> | T, propertyKey: string | ((tag: T) => Function), ...providers: ParamProviders[]): TR;

    /**
     * create params instances with IParameter and provider
     *
     * @param {IParameter[]} params
     * @param {...AsyncParamProvider[]} providers
     * @returns {Promise<any[]>}
     * @memberof IMethodAccessor
     */
    createParams(params: IParameter[], ...providers: ParamProviders[]): any[];

}
