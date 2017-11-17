import 'reflect-metadata';
import { IContainer } from './IContainer';
import { Token, Factory, ObjectMap, SymbolType, ToInstance } from './types';
import { Registration } from './Registration';
import { Injectable, InjectableMetadata } from './decorators/Injectable';
import { Type, AbstractType } from './Type';
import { AutoWired, AutoWiredMetadata } from './decorators/AutoWried';
import { ParameterMetadata } from './decorators/Metadata';
import { PropertyMetadata } from './index';


export const NOT_FOUND = new Object();

/**
 * Container.
 */
export class Container implements IContainer {
    private factories: Map<Token<any>, any>;
    private singleton: Map<Token<any>, any>;
    constructor() {
        this.factories = new Map<Token<any>, any>();
        this.singleton = new Map<Token<any>, any>();
        this.init();
    }

    init() {
        this.register(Date);
        this.register(String);
        this.register(Number);
        this.register(Boolean);
        this.register(Object);
    }

    /**
     * get instance via token.
     * @template T
     * @param {Token<T>} [token]
     * @param {T} [notFoundValue]
     * @returns {T}
     *
     * @memberOf DefaultInjectableor
     */
    get<T>(token?: Token<T>, notFoundValue?: T): T {
        let key = this.getTokenKey<T>(token);
        if (!this.hasRegister(key)) {
            return notFoundValue === undefined ? (NOT_FOUND as T) : notFoundValue;
        }
        let factory = this.factories.get(key);
        return factory() as T;
    }

    /**
     * register type.
     * @abstract
     * @template T
     * @param {Token<T>} token
     * @param {T} [value]
     * @memberOf Injectableor
     */
    register<T>(token: Token<T>, value?: Factory<T>) {
        this.registerFactory(token, value);
    }

    /**
     * has token.
     *
     * @template T
     * @param {Token<T>} token
     * @returns {boolean}
     * @memberof Container
     */
    has<T>(token: Token<T>): boolean {
        let key = this.getTokenKey(token);
        return this.hasRegister(key);
    }

    /**
     * has register type.
     *
     * @template T
     * @param {SymbolType<T>} key
     * @returns
     * @memberof Container
     */
    hasRegister<T>(key: SymbolType<T>) {
        return this.factories.has(key);
    }

    /**
     * register stingleton type.
     * @abstract
     * @template T
     * @param {Token<T>} token
     * @param {Factory<T>} [value]
     *
     * @memberOf Injectableor
     */
    registerSingleton<T>(token: Token<T>, value?: Factory<T>) {
        this.registerFactory(token, value, true);
    }

    protected getTokenKey<T>(token: Token<T>, alias?: string): SymbolType<T> {
        if (token instanceof Registration) {
            return token.toString();
        } else {
            if (alias && typeof token === 'function') {
                return new Registration(token, alias).toString();
            }
            return token;
        }
    }

    protected registerFactory<T>(token: Token<T>, value?: Factory<T>, singleton?: boolean) {
        let key = this.getTokenKey(token);

        if (this.factories.has(key)) {
            return;
        }

        let classFactory;
        if (typeof value !== 'undefined') {
            if (typeof value === 'function') {
                if (value.constructor) {
                    classFactory = this.createTypeFactory(key, value as Type<T>, singleton);
                } else {
                    classFactory = this.createCustomFactory(key, value as ToInstance<T>, singleton);
                }
            } else if (singleton && value !== undefined) {
                let symbolValue = value;
                classFactory = () => {
                    return symbolValue;
                }
            }

        } else if (typeof token !== 'string' && typeof token !== 'symbol') {
            let ClassT = (token instanceof Registration) ? token.getClass() : token;
            classFactory = this.createTypeFactory(key, ClassT as Type<T>, singleton);
        }

        if (classFactory) {
            this.factories.set(key, classFactory);
        }
    }

    createCustomFactory<T>(key: SymbolType<T>, value?: ToInstance<T>, singleton?: boolean) {
        return () => {
            if (singleton && this.singleton.has(key)) {
                return this.singleton.get(key);
            }
            let instance = value(this);
            if (singleton) {
                this.singleton.set(key, instance);
            }
            return instance;
        }
    }

    createTypeFactory<T>(key: SymbolType<T>, ClassT?: Type<T>, singleton?: boolean) {
        if (!Reflect.isExtensible(ClassT)) {
            return null;
        }
        let parameters = this.getParameterMetadata(ClassT);
        this.registerDependencies(...parameters);
        let props = this.getPropMetadata(ClassT);
        this.registerDependencies(...props.map(it => it.type));
        if (!singleton) {
            singleton = this.isSingletonType<T>(ClassT);
        }

        let factory = () => {
            if (singleton && this.singleton.has(key)) {
                return this.singleton.get(key);
            }

            let paramInstances = parameters.map((type, index) => this.get(type));
            let instance = new ClassT(...paramInstances);
            if (instance) {
                props.forEach((prop, idx) => {
                    instance[prop.propertyName] = this.get(prop.type);
                });
            }

            if (singleton) {
                this.singleton.set(key, instance);
            }
            return instance;
        };

        // register provider.
        let injectableConfig = Reflect.getOwnMetadata('@Injectable', ClassT) as InjectableMetadata[];
        if (Array.isArray(injectableConfig) && injectableConfig.length > 0) {
            let jcfg = injectableConfig.find(c => c && !!(c.provider || c.alias));
            if (jcfg) {
                let providerKey = this.getTokenKey(jcfg.provider, jcfg.alias);
                this.factories.set(providerKey, factory);
            }
        }

        return factory;
    }

    protected isSingletonType<T>(type: Type<T>): boolean {
        return Reflect.hasOwnMetadata('@Singleton', type);
    }

    protected getParameterMetadata<T>(type: Type<T>): Type<any>[] {
        let designParams: Type<any>[] = Reflect.getOwnMetadata('design:paramtypes', type) || [];
        designParams = designParams.slice(0);
        if (designParams.length > 0) {
            ['@AutoWired', '@Inject', '@Param'].forEach(name => {
                let parameters: ParameterMetadata[] = Reflect.getOwnMetadata(name, type) || [];
                if (Array.isArray(parameters) && parameters.length > 0) {
                    parameters.forEach(params => {
                        let parm = Array.isArray(params) && params.length > 0 ? params[0] : params;
                        if (parm && parm.index >= 0 && parm.type) {
                            designParams[parm.index] = parm.type;
                        }
                    });
                }
            });
        }

        return designParams;
    }

    protected getPropMetadata<T>(type: Type<T>): PropertyMetadata[] {
        let prop = Reflect.getOwnMetadata('@Inject', type) || {} as ObjectMap<PropertyMetadata[]>;
        let wiredprop = Reflect.getOwnMetadata('@AutoWired', type) || {} as ObjectMap<PropertyMetadata[]>;
        for (let n in wiredprop) {
            if (!prop[n]) {
                prop[n] = wiredprop[n];
            }
        }

        let props = [];
        for (let n in prop) {
            props = props.concat(prop[n]);
        }
        return props;
    }

    protected registerDependencies<T>(...deps: Token<T>[]) {
        deps.forEach(depType => {
            if (this.has(depType)) {
                return;
            }
            let injectableConfig: any[] = Reflect.getOwnMetadata('@Injectable', depType);
            if (injectableConfig && injectableConfig.length > 0) {
                this.register(depType);
            }
        });
    }
}


