import { Type, Providers, Token, ObjectMap, InstanceFactory } from '../types';
import { Provider, ProviderMap, ParamProvider, InvokeProvider, ExtendsProvider, AsyncParamProvider, isProviderMap } from './providers/index';
import { isString, isClass, isFunction, isNumber, isUndefined, isNull, isToken, isBaseObject, lang } from '../utils/index';
import { IParameter } from '../IParameter';
import { IProviderMatcher } from './IProviderMatcher';
import { IContainer } from '../IContainer';

/**
 * provider matcher. use to find custome providers in resolve.
 *
 * @export
 * @class ProviderMatcher
 * @implements {IProviderMatcher}
 */
export class ProviderMatcher implements IProviderMatcher {

    constructor(private container: IContainer) {

    }

    toProviderMap(...providers: Providers[]): ProviderMap {
        if (providers.length === 1 && isProviderMap(providers[0])) {
            return providers[0];
        }
        let map = this.container.resolve(ProviderMap);
        providers.forEach((p, index) => {
            if (isUndefined(p) || isNull(p)) {
                return;
            }
            if (isProviderMap(p)) {
                map.copy(p);
            } else if (p instanceof Provider) {
                if (p instanceof ParamProvider) {
                    if (!p.type && isNumber(p.index)) {
                        map.add(p.index, (...providers: Providers[]) => p.resolve(this.container, ...providers));
                    } else {
                        map.add(p.type, (...providers: Providers[]) => p.resolve(this.container, ...providers));
                    }

                } else {
                    map.add(p.type, (...providers: Providers[]) => p.resolve(this.container, ...providers));
                }
            } else {
                if (isBaseObject(p)) {
                    lang.forIn<any>(p, (val, name) => {
                        if (!isUndefined(val)) {
                            if (isClass(val)) {
                                map.add(name, val);
                            } else if (isFunction(val) || isString(val)) {
                                map.add(name, () => val);
                            } else {
                                map.add(name, val);
                            }
                        }
                    })
                } else if (isFunction(p)) {
                    map.add(name, () => p);
                } else {
                    map.add(index, p);
                }
            }
        });

        return map;
    }

    matchProviders(params: IParameter[], ...providers: Providers[]): ProviderMap {
        return this.match(params, this.toProviderMap(...providers));
    }

    match(params: IParameter[], providers: ProviderMap): ProviderMap {
        let map = this.container.resolve(ProviderMap);
        if (!params.length) {
            return map;
        }
        params.forEach((param, index) => {
            if (!param.name) {
                return;
            }
            if (providers.has(param.name)) {
                map.add(param.name, providers.get(param.name));
            } else if (isToken(param.type)) {
                if (providers.has(param.type)) {
                    map.add(param.name, providers.get(param.type));
                } else if (this.container.has(param.type)) {
                    map.add(param.name, param.type);
                }
            } else if (providers.has(index)) {
                map.add(param.name, providers.get(index));
            }
        });

        return map;
    }

}
