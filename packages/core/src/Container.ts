import 'reflect-metadata';
import { IContainer, ContainerToken } from './IContainer';
import {
    Type, Token, Factory, SymbolType, ToInstance, IocState, ProviderTypes,
    Modules, LoadType, ReferenceToken, IReference, RefTokenType, RefTokenFacType, RefTokenFac
} from './types';
import { isClass, isFunction, isSymbol, isToken, isString, isUndefined, lang, isArray, isBoolean } from './utils';
import { Registration, isRegistrationClass } from './Registration';
import { MethodAccessorToken } from './IMethodAccessor';
import { ActionComponent, CoreActions, CacheActionData, LifeState, ProviderParserToken, ProviderMap } from './core';
import { LifeScope, LifeScopeToken } from './LifeScope';
import { IParameter } from './IParameter';
import { CacheManagerToken } from './ICacheManager';
import { IContainerBuilder, ContainerBuilderToken } from './IContainerBuilder';
import { registerCores } from './registerCores';
import { ResolverChain, ResolverChainToken } from './resolves';
import { InjectReference, InjectClassProvidesToken } from './InjectReference';

/**
 * singleton reg token.
 */
const SingletonRegToken = '___IOC__Singleton___';

/**
 * Container
 *
 * @export
 * @class Container
 * @implements {IContainer}
 */
export class Container implements IContainer {
    protected provideTypes: Map<Token<any>, Type<any>>;
    protected factories: Map<Token<any>, Function>;

    /**
     * parent container.
     *
     * @type {IContainer}
     * @memberof Container
     */
    parent: IContainer

    constructor() {
        this.init();
    }

    getRoot(): IContainer {
        let root: IContainer = this;
        while (root.parent) {
            root = root.parent;
        }
        return root;
    }

    getBuilder(): IContainerBuilder {
        return this.resolveValue(ContainerBuilderToken);
    }

    /**
    * resolve token value in this container only.
    *
    * @template T
    * @param {Token<T>} token
    * @param {...ProviderTypes[]} providers
    * @returns {T}
    * @memberof Container
    */
    getResolvers(): ResolverChain {
        return this.resolveValue(ResolverChainToken);
    }

    /**
     * has register the token or not.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @returns {boolean}
     * @memberof Container
     */
    has<T>(token: Token<T>, alias?: string): boolean {
        let key = this.getTokenKey(token, alias);
        return this.getResolvers().has(key);
    }

    /**
     * has register type.
     *
     * @template T
     * @param {Token<T>} key
     * @returns
     * @memberof Container
     */
    hasRegister<T>(key: Token<T>) {
        return this.factories.has(this.getTokenKey(key));
    }

    /**
     * Retrieves an instance from the container based on the provided token.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof Container
     */
    get<T>(token: Token<T>, alias?: string, ...providers: ProviderTypes[]): T {
        return this.resolve(alias ? this.getTokenKey<T>(token, alias) : token, ...providers);
    }

    /**
     * resolve type instance with token and param provider.
     *
     * @template T
     * @param {Token<T>} token
     * @param {T} [notFoundValue]
     * @param {...ProviderTypes[]} providers
     * @memberof Container
     */
    resolve<T>(token: Token<T>, ...providers: ProviderTypes[]): T {
        let key = this.getTokenKey<T>(token);
        return this.getResolvers().resolve(key, ...providers);
    }

    /**
     * resolve token value in this container only.
     *
     * @template T
     * @param {Token<T>} token
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    resolveValue<T>(token: Token<T>, ...providers: ProviderTypes[]): T {
        let key = this.getTokenKey(token);
        if (!this.hasRegister(key)) {
            return null;
        }
        let factory = this.factories.get(key);
        return factory(...providers) as T;
    }

    /**
     * get service or target reference service.
     *
     * @template T
     * @param {Token<T>} token servive token.
     * @param {(Token<any> | Token<any>[])} [target] service refrence target.
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof Container
     */
    getService<T>(token: Token<T>, target?: Token<any> | Token<any>[] | ProviderTypes, toRefToken?: boolean | Token<T> | RefTokenFac<T> | ProviderTypes, defaultToken?: boolean | Token<T> | ProviderTypes, ...providers: ProviderTypes[]): T {
        if (isToken(target) || isArray(target)) {
            let tokens = this.getTokenExtendsChain(token, false).map(t => {
                return { service: t, isPrivate: true } as IReference<T>;
            });
            let fac: RefTokenFac<T>;
            let defToken: Token<T>;
            let prds: ProviderTypes[] = [];
            if (isBoolean(toRefToken)) {
                if (toRefToken) {
                    defToken = token;
                } else {
                    defToken = null;
                }
            } else if (isToken(toRefToken)) {
                defToken = toRefToken;
            } else if (isFunction(toRefToken)) {
                fac = toRefToken;
                if (isBoolean(defaultToken)) {
                    if (defaultToken) {
                        defToken = token;
                    } else {
                        defToken = null;
                    }
                } else if (isToken(defaultToken)) {
                    defToken = defaultToken;
                } else if (defaultToken) {
                    prds.push(defaultToken);
                }
            } else if (toRefToken) {
                prds.unshift(toRefToken);
            }


            defToken = defToken === null ? null : (defToken || token);
            providers = prds.concat(providers);
            return this.getRefService(
                [
                    ...tokens,
                    ...fac ? [tk => fac(tk)] : [],
                    ...tokens.map(t => (tk) => new InjectReference(t.service, tk))
                ],
                target,
                defToken,
                ...providers);
        } else {
            return this.resolve(token, ...[target, toRefToken as ProviderTypes, defaultToken as ProviderTypes].filter(a => a).concat(providers));
        }
    }

    /**
     * get target reference service.
     *
     * @template T
     * @param {Type<Registration<T>>} [refToken] reference service Registration Injector
     * @param {Token<any> | Token<any>[]} target  the service reference to.
     * @param {Token<T>} [defaultToken] default service token.
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof Container
     */
    getRefService<T>(refToken: ReferenceToken<T>, target: Token<any> | Token<any>[], defaultToken?: Token<T>, ...providers: ProviderTypes[]): T {
        let service: T = null;
        (isArray(target) ? target : [target])
            .some(tag => this.getTokenExtendsChain(tag).some(tk => {
                console.log('target:', tk);
                // exclude ref registration.
                if (tk instanceof InjectReference) {
                    return false;
                }
                return (isArray(refToken) ? refToken : [refToken]).some(stk => {
                    let tokens = this.getRefToken(stk, tk);
                    return (isArray(tokens) ? tokens : [tokens]).some(rtk => {
                        service = this.resolveRef(rtk, tk, ...providers);
                        return service !== null;
                    });
                });
            }));
        if (!service && defaultToken && this.has(defaultToken)) {
            service = this.resolve(defaultToken, ...providers);
        }

        console.log('------------------\ngetRefService:', refToken, target, defaultToken, service ? service.constructor.name : 'service-null');
        return service;
    }

    protected getRefToken<T>(ref: RefTokenFacType<T>, tk: Token<any>): RefTokenType<T> | RefTokenType<T>[] {
        if (isRegistrationClass(ref)) {
            return new ref(tk);
        }
        if (isToken(ref)) {
            return ref;
        }
        if (isFunction(ref)) {
            return ref(tk);
        }
        return ref;
    }

    protected resolveRef<T>(refToken: RefTokenType<T>, target: Token<any>, ...providers: ProviderTypes[]): T {
        let tk: Token<T>;
        let isPrivate = false;
        if (isToken(refToken)) {
            tk = refToken;
        } else {
            tk = refToken.service;
            isPrivate = refToken.isPrivate === true;
        }

        if (!tk) {
            return null;
        }

        if (isPrivate) {
            if (!isClass(target)) {
                return null;
            }
            let pdrmap = this.get(new InjectReference(ProviderMap, target));
            console.log('+++++++++++++++++++++++++++++++++++++++\nis Private:', tk, target.name, pdrmap ? pdrmap['maps'] : null, (pdrmap && pdrmap.has(tk)) === true);
            return (pdrmap && pdrmap.has(tk)) ? pdrmap.resolve(tk, ...providers) : null;
        } else {
            if (this.has(tk)) {
                console.log('+++++++++++++++++++++++++++++++++++++++\nnot Private:', tk, this.has(tk));
            }
            return this.resolve(tk, ...providers);
        }
    }

    /**
     * get tocken key.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @returns {SymbolType<T>}
     * @memberof Container
     */
    getTokenKey<T>(token: Token<T>, alias?: string): SymbolType<T> {
        if (alias) {
            return new Registration(token, alias).toString();
        } else if (token instanceof Registration) {
            return token.toString();
        }
        return token;
    }

    /**
     * register type.
     * @abstract
     * @template T
     * @param {Token<T>} token
     * @param {T} [value]
     * @returns {this}
     * @memberOf Container
     */
    register<T>(token: Token<T>, value?: Factory<T>): this {
        this.registerFactory(token, value);
        return this;
    }

    /**
     * register stingleton type.
     * @abstract
     * @template T
     * @param {Token<T>} token
     * @param {Factory<T>} [value]
     * @returns {this}
     * @memberOf Container
     */
    registerSingleton<T>(token: Token<T>, value?: Factory<T>): this {
        this.registerFactory(token, value, true);
        return this;
    }

    /**
     * register value.
     *
     * @template T
     * @param {Token<T>} token
     * @param {T} value
     * @returns {this}
     * @memberof Container
     */
    registerValue<T>(token: Token<T>, value: T): this {
        let key = this.getTokenKey(token);

        this.getSingleton().set(key, value);
        if (!this.factories.has(key)) {
            this.factories.set(key, () => {
                return this.getSingleton().get(key);
            });
        }

        return this;
    }

    /**
     * bind provider.
     *
     * @template T
     * @param {Token<T>} provide
     * @param {Token<T>} provider
     * @returns {this}
     * @memberof Container
     */
    bindProvider<T>(provide: Token<T>, provider: Token<T> | Factory<T>): this {
        let provideKey = this.getTokenKey(provide);
        let factory;
        if (isToken(provider)) {
            factory = (...providers: ProviderTypes[]) => {
                return this.resolve(provider, ...providers);
            };
        } else {
            if (isFunction(provider)) {
                factory = (...providers: ProviderTypes[]) => {
                    return (<ToInstance<any>>provider)(this, ...providers);
                };
            } else {
                factory = () => {
                    return provider
                };
            }
        }
        if (isClass(provider)) {
            if (!this.has(provider)) {
                this.register(provider);
            }
            this.provideTypes.set(provideKey, provider);
        } else if (isToken(provider)) {
            let token = provider;
            while (this.provideTypes.has(token) && !isClass(token)) {
                token = this.provideTypes.get(token);
                if (isClass(token)) {
                    this.provideTypes.set(provideKey, token);
                    break;
                }
            }
        }

        this.factories.set(provideKey, factory);
        return this;
    }

    /**
     * unregister the token
     *
     * @template T
     * @param {Token<T>} token
     * @returns {this}
     * @memberof Container
     */
    unregister<T>(token: Token<T>, inchain?: boolean): this {
        let key = this.getTokenKey(token);
        if (inchain === false) {
            if (this.hasRegister(key)) {
                this.factories.delete(key);
                if (this.provideTypes.has(key)) {
                    this.provideTypes.delete(key);
                }
                if (isClass(key)) {
                    this.clearCache(key);
                }
            }
        } else {
            this.getResolvers().unregister(key);
        }
        return this;
    }

    /**
     * clear cache.
     *
     * @param {Type<any>} targetType
     * @memberof IContainer
     */
    clearCache(targetType: Type<any>) {
        this.resolveValue(CacheManagerToken).destroy(targetType);
    }

    /**
     * get token.
     *
     * @template T
     * @param {Token<T>} token
     * @param {string} [alias]
     * @returns {Token<T>}
     * @memberof Container
     */
    getToken<T>(token: Token<T>, alias?: string): Token<T> {
        if (alias) {
            return new Registration(token, alias);
        }
        return token;
    }

    /**
     * get token implements class type.
     *
     * @template T
     * @param {Token<T>} token
     * @param {boolean} [inchain]
     * @returns {Type<T>}
     * @memberof Container
     */
    getTokenImpl<T>(token: Token<T>, inchain?: boolean): Type<T> {
        let tokenKey = this.getTokenKey(token);
        if (inchain === false) {
            if (isClass(token)) {
                return token;
            }
            if (this.provideTypes.has(tokenKey)) {
                return this.provideTypes.get(tokenKey);
            }
            return null;
        } else {
            return this.getResolvers().getTokenImpl(tokenKey);
        }
    }


    /**
     * get token implement class and base classes.
     *
     * @param {Token<any>} token
     * @returns {Token<any>[]}
     * @memberof Container
     */
    getTokenExtendsChain(token: Token<any>, chain = true): Token<any>[] {
        let type: Type<any>;
        if (isClass(token)) {
            type = token;
            if (!this.has(type)) {
                this.use(type);
            }
        } else {
            type = this.getTokenImpl(token);
        }
        if (!isClass(type)) {
            if (!this.has(type)) {
                this.use(type);
            }
            return token ? [token] : [];
        }
        let types = chain ? lang.getBaseClasses(type) : [type];
        let tokens: Token<any>[] = [];
        types.forEach(type => {
            if (type) {
                let prds = this.get(new InjectClassProvidesToken(type));
                if (prds && prds.provides && prds.provides.length) {
                    tokens.push(...prds.provides);
                }
                tokens.push(type);
            }
        });
        return tokens;
    }

    /**
    * get life scope of container.
    *
    * @returns {LifeScope}
    * @memberof IContainer
    */
    getLifeScope(): LifeScope {
        return this.get(LifeScopeToken);
    }

    /**
     * use modules.
     *
     * @param {...Modules[]} modules
     * @returns {this}
     * @memberof Container
     */
    use(...modules: Modules[]): this {
        this.getBuilder().syncLoadModule(this, ...modules);
        return this;
    }

    /**
     * async use modules.
     *
     * @param {...LoadType[]} modules load modules.
     * @returns {Promise<Type<any>[]>}  types loaded.
     * @memberof IContainer
     */
    loadModule(...modules: LoadType[]): Promise<Type<any>[]> {
        return this.getBuilder().loadModule(this, ...modules);
    }

    /**
     * invoke method async.
     *
     * @template T
     * @param {Token<any>} token
     * @param {string} propertyKey
     * @param {*} [instance]
     * @param {...ProviderTypes[]} providers
     * @returns {Promise<T>}
     * @memberof Container
     */
    invoke<T>(token: Token<any>, propertyKey: string, instance?: any, ...providers: ProviderTypes[]): Promise<T> {
        return this.resolveValue(MethodAccessorToken).invoke(token, propertyKey, instance, ...providers);
    }

    /**
     * invoke method.
     *
     * @template T
     * @param {Token<any>} token
     * @param {string} propertyKey
     * @param {*} [instance]
     * @param {...ProviderTypes[]} providers
     * @returns {T}
     * @memberof Container
     */
    syncInvoke<T>(token: Token<any>, propertyKey: string, instance?: any, ...providers: ProviderTypes[]): T {
        return this.resolveValue(MethodAccessorToken).syncInvoke(token, propertyKey, instance, ...providers);
    }

    createSyncParams(params: IParameter[], ...providers: ProviderTypes[]): any[] {
        return this.resolveValue(MethodAccessorToken).createSyncParams(params, ...providers);
    }

    createParams(params: IParameter[], ...providers: ProviderTypes[]): Promise<any[]> {
        return this.resolveValue(MethodAccessorToken).createParams(params, ...providers);
    }

    protected cacheDecorator<T>(map: Map<string, ActionComponent>, action: ActionComponent) {
        if (!map.has(action.name)) {
            map.set(action.name, action);
        }
    }

    protected init() {
        this.factories = new Map();
        this.provideTypes = new Map();
        this.bindProvider(ContainerToken, () => this);

        registerCores(this);
    }

    protected getSingleton(): Map<Token<any>, any> {
        if (!this.hasRegister(SingletonRegToken)) {
            this.bindProvider(SingletonRegToken, new Map<Token<any>, any>());
        }
        return this.resolveValue(SingletonRegToken);
    }

    protected registerFactory<T>(token: Token<T>, value?: Factory<T>, singleton?: boolean) {
        let key = this.getTokenKey(token);

        if (this.factories.has(key)) {
            return;
        }

        let classFactory;
        if (!isUndefined(value)) {
            if (isFunction(value)) {
                if (isClass(value)) {
                    this.bindTypeFactory(key, value as Type<T>, singleton);
                } else {
                    classFactory = this.createCustomFactory(key, value as ToInstance<T>, singleton);
                }
            } else if (singleton && value !== undefined) {
                classFactory = this.createCustomFactory(key, () => value, singleton);
            }

        } else if (!isString(token) && !isSymbol(token)) {
            let ClassT = (token instanceof Registration) ? token.getClass() : token;
            if (isClass(ClassT)) {
                this.bindTypeFactory(key, ClassT as Type<T>, singleton);
            }
        }

        if (classFactory) {
            this.factories.set(key, classFactory);
        }
    }

    protected createCustomFactory<T>(key: SymbolType<T>, factory?: ToInstance<T>, singleton?: boolean) {
        return singleton ?
            (...providers: ProviderTypes[]) => {
                if (this.getSingleton().has(key)) {
                    return this.getSingleton().get(key);
                }
                let instance = factory(this, ...providers);
                this.getSingleton().set(key, instance);
                return instance;
            }
            : (...providers: ProviderTypes[]) => factory(this, ...providers);
    }

    protected bindTypeFactory<T>(key: SymbolType<T>, ClassT?: Type<T>, singleton?: boolean) {
        if (!Reflect.isExtensible(ClassT)) {
            return;
        }

        let lifeScope = this.getLifeScope();
        let parameters = lifeScope.getConstructorParameters(ClassT);
        if (!singleton) {
            singleton = lifeScope.isSingletonType<T>(ClassT);
        }

        let factory = (...providers: ProviderTypes[]) => {
            if (singleton && this.getSingleton().has(key)) {
                return this.getSingleton().get(key);
            }

            if (providers.length < 1) {
                let lifecycleData: CacheActionData = {
                    tokenKey: key,
                    targetType: ClassT,
                    // raiseContainer: this,
                    singleton: singleton
                };
                lifeScope.execute(lifecycleData, CoreActions.cache);
                if (lifecycleData.execResult && lifecycleData.execResult instanceof ClassT) {
                    return lifecycleData.execResult;
                }
            }

            let providerMap = this.get(ProviderParserToken).parse(...providers);

            lifeScope.execute({
                tokenKey: key,
                targetType: ClassT,
                raiseContainer: this,
                params: parameters,
                providers: providers,
                providerMap: providerMap,
                singleton: singleton
            }, IocState.runtime, LifeState.beforeCreateArgs);

            let args = this.createSyncParams(parameters, providerMap);

            lifeScope.routeExecute({
                tokenKey: key,
                targetType: ClassT,
                raiseContainer: this,
                args: args,
                params: parameters,
                providers: providers,
                providerMap: providerMap,
                singleton: singleton
            }, IocState.runtime, LifeState.beforeConstructor);

            let instance = new ClassT(...args);

            lifeScope.routeExecute({
                tokenKey: key,
                target: instance,
                targetType: ClassT,
                raiseContainer: this,
                args: args,
                params: parameters,
                providers: providers,
                providerMap: providerMap,
                singleton: singleton
            }, IocState.runtime, LifeState.afterConstructor);

            lifeScope.execute({
                tokenKey: key,
                target: instance,
                targetType: ClassT,
                raiseContainer: this,
                args: args,
                params: parameters,
                providers: providers,
                providerMap: providerMap,
                singleton: singleton
            }, IocState.runtime, LifeState.onInit);


            lifeScope.routeExecute({
                tokenKey: key,
                target: instance,
                targetType: ClassT,
                raiseContainer: this,
                args: args,
                params: parameters,
                providers: providers,
                providerMap: providerMap,
                singleton: singleton
            }, IocState.runtime, LifeState.AfterInit);

            lifeScope.execute({
                tokenKey: key,
                target: instance,
                targetType: ClassT,
                raiseContainer: this
            }, CoreActions.cache);

            return instance;
        };

        this.factories.set(key, factory);

        lifeScope.routeExecute({
            tokenKey: key,
            targetType: ClassT,
            raiseContainer: this
        }, IocState.design);

    }
}


