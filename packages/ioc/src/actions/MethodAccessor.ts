import { Token, Type, ObjectMap } from '../types';
import { IParameter } from '../IParameter';
import { lang, isFunction, isBaseType } from '../utils/lang';
import { isToken } from '../utils/isToken';
import { IInjector, PROVIDERS, IProviders } from '../IInjector';
import { IMethodAccessor, MethodType } from '../IMethodAccessor';
import { ParamProviders } from '../providers/types';
import { RuntimeActionContext } from './runtime/RuntimeActionContext';
import { RuntimeParamScope } from './runtime/RuntimeParamScope';
import { TypeReflectsToken } from '../services/ITypeReflects';


/**
 * method accessor
 *
 * @export
 * @class MethodAccessor
 * @implements {IMethodAccessor}
 */
export class MethodAccessor implements IMethodAccessor {

    private caches: WeakMap<any, Map<string, IProviders>>;
    constructor() {
        this.caches = new WeakMap();
    }

    /**
     * try to async invoke the method of intance, if no instance will create by type.
     *
     * @template T
     * @param {IInjector} injector
     * @param {*} target
     * @param {(string | ((tag: T) => Function))} propertyKey
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IMethodAccessor
     */
    invoke<T, TR = any>(injector: IInjector, target: Token<T> | T, propertyKey: MethodType<T>, ...providers: ParamProviders[]): TR {
        let targetClass: Type;
        let instance: T;
        if (isToken(target)) {
            targetClass = injector.getTokenProvider(target);
            instance = injector.get(target, ...providers);
            lang.assert(targetClass, target.toString() + ' is not implements by any class.');
        } else {
            targetClass = lang.getClass(target);
            instance = target;
        }

        let reflects = injector.getSingleton(TypeReflectsToken);
        let tgRefl = reflects.get(targetClass);
        let key: string;
        if (isFunction(propertyKey)) {
            let descriptors = tgRefl.defines.getPropertyDescriptors();
            key = tgRefl.defines.getPropertyName(propertyKey(descriptors as any) as TypedPropertyDescriptor<any>);
        } else {
            key = propertyKey;
        }

        lang.assertExp(instance && isFunction(instance[key]), `type: ${targetClass} has no method ${(key || '').toString()}.`);

        let pds = tgRefl.methodParamProviders.get(key) || [];
        providers = providers.concat(pds);
        let parameters = tgRefl.methodParams.has(key) ? tgRefl.methodParams.get(key) : this.getParameters(injector, targetClass, instance, key);
        let providerMap = injector.getInstance(PROVIDERS).inject(...providers);
        let paramInstances = this.resolveParams(injector, parameters, providerMap);
        if (!this.caches.has(target)) {
            this.caches.set(target, new Map().set(key, providerMap));
        } else {
            this.caches.get(target).set(key, providerMap);
        }
        return instance[key](...paramInstances) as TR;
    }

    /**
     * get target invoked providers.
     *
     * @param {*} target
     * @param {string} propertyKey
     * @returns {Injector}
     * @memberof IMethodAccessor
     */
    invokedProvider(target: any, propertyKey: string): IProviders {
        return this.caches.get(target)?.get(propertyKey) ?? null;
    }

    /**
     * create params instance.
     *
     * @param {IInjector} injector
     * @param {IParameter[]} params
     * @param {...ParamProviders[]} providers
     * @returns {any[]}
     * @memberof MethodAccessor
     */
    createParams(injector: IInjector, params: IParameter[], ...providers: ParamProviders[]): any[] {
        return this.resolveParams(injector, params, injector.getInstance(PROVIDERS).inject(...providers));
    }

    protected resolveParams(injector: IInjector, params: IParameter[], providers: IInjector): any[] {
        return params.map((param, index) => {
            if (param.provider && providers.has(param.provider)) {
                return providers.get(param.provider);
            } else if (param.name && providers.has(param.name)) {
                return providers.get(param.name);
            } else if (param.provider) {
                return injector.get(param.provider, providers);
            } else if (isToken(param.type)) {
                if (providers.has(param.type)) {
                    return providers.get(param.type);
                }
                if (isFunction(param.type) && isBaseType(param.type)) {
                    return undefined;
                }
                return injector.get(param.type, providers);
            } else {
                return undefined;
            }
        });
    }

    /**
     * get type class constructor parameters.
     *
     * @template T
     * @param {IInjector} container
     * @param {Type<T>} type
     * @returns {IParameter[]}
     * @memberof MethodAccessor
     */
    getParameters<T>(container: IInjector, type: Type<T>): IParameter[];
    /**
     * get method parameters of type.
     *
     * @template T
     * @param {IInjector} injector
     * @param {Type<T>} type
     * @param {T} instance
     * @param {string} propertyKey
     * @returns {IParameter[]}
     * @memberof MethodAccessor
     */
    getParameters<T>(injector: IInjector, type: Type<T>, instance: T, propertyKey: string): IParameter[];
    getParameters<T>(injector: IInjector, type: Type<T>, instance?: T, propertyKey?: string): IParameter[] {
        let ctx = RuntimeActionContext.parse(injector, {
            type: type,
            target: instance,
            propertyKey: propertyKey,
        });
        injector.getContainer().getActionInjector().getInstance(RuntimeParamScope).execute(ctx);
        let params = ctx.targetReflect.methodParams.get(propertyKey);
        return params || [];
    }
}
