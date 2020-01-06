import { createRaiseContext, IInjector, ResolveActionContext, Token, ClassType } from '@tsdi/ioc';
import { ServiceOption, ResolveServiceContext } from '../service/ResolveServiceContext';
import { CTX_TOKENS, CTX_TYPES } from '../../context-tokens';

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
     * @param { IInjector } injecor
     * @param {ServicesOption<T>} target
     * @returns {ResolveServicesContext}
     * @memberof ResolveServicesContext
     */
    static parse<T>(injecor: IInjector, options: ServicesOption<T>): ResolveServicesContext<T> {
        return createRaiseContext<ResolveServicesContext>(injecor, ResolveServicesContext, options);
    }

    get types(): ClassType[] {
        if (!this.has(CTX_TYPES)) {
            let types = this.tokens.map(t => this.injector.getTokenProvider(t))
                .filter(t => t);
            this.set(CTX_TYPES, types);
        }
        return this.get(CTX_TYPES);
    }

    /**
     * all matched services map.
     *
     * @type {Injector}
     * @memberof ResolveServicesContext
     */
    services?: IInjector;

}