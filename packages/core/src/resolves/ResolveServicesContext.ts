import { ClassType, ProviderMap, Token, createRaiseContext, ContainerFactory, isToken } from '@tsdi/ioc';
import { ServiceOption, ResolveServiceContext } from './ResolveServiceContext';

/**
 * services context options
 *
 * @export
 * @interface ServicesOption
 * @extends {ServiceOption}
 */
export interface ServicesOption<T> extends ServiceOption<T> {
    /**
     * get services both in container and target private refrence service.
     *
     * @type {boolean}
     * @memberof ServicesActionOption
     */
    both?: boolean;
    /**
     * class type.
     *
     * @type {ClassType[]}
     * @memberof ServicesActionOption
     */
    types?: ClassType[];
}

/**
 * resolve services context.
 *
 * @export
 * @class ResolveServicesContext
 * @extends {ResolveServiceContext}
 */
export class ResolveServicesContext<T = any> extends ResolveServiceContext<T, ServicesOption<T>> {
    /**
     * parse service resolve context.
     *
     * @static
     * @param {(Token<T> | ServicesOption<T>)} target
     * @returns {ResolveServicesContext}
     * @memberof ResolveServicesContext
     */
    static parse<T>(target: Token<T> | ServicesOption<T>, raiseContainer?: ContainerFactory): ResolveServicesContext<T> {
        return createRaiseContext<ResolveServicesContext>(ResolveServicesContext, isToken(target) ? { token: target } : target, raiseContainer);
    }

    get types(): ClassType[] {
        return this.getOptions().types;
    }

    /**
     * all matched services map.
     *
     * @type {ProviderMap}
     * @memberof ResolveServicesContext
     */
    services?: ProviderMap;

}
