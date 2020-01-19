import { Token } from '../types';
import { createRaiseContext, IocProvidersContext, IocProvidersOption } from './IocAction';
import { IInjector } from '../IInjector';
import { CTX_TOKEN, CTX_DEFAULT_TOKEN } from '../context-tokens';

/**
 * resovle action option.
 *
 * @export
 * @interface ResolveActionOption
 */
export interface ResolveActionOption<T> extends IocProvidersOption {
    /**
     * token.
     *
     * @type {Token<T>}
     * @memberof ResolveActionOption
     */
    token?: Token<T>;
    /**
     * resolve token in target context.
     */
    target?: Token | Object | (Token | Object)[];
    /**
     * only for target private or ref token. if has target.
     */
    tagOnly?: boolean;
    /**
     * all faild use the default token to get instance.
     */
    default?: Token<T>;
    /**
     * register token if has not register.
     *
     * @type {boolean}
     * @memberof ResolveActionOption
     */
    regify?: boolean;

}


/**
 * resolve action context.
 *
 * @export
 * @interface IResolverContext
 */
export class ResolveActionContext<T = any, TOP extends ResolveActionOption<T> = ResolveActionOption<T>> extends IocProvidersContext<TOP> {

    /**
     * token.
     *
     * @type {Token}
     * @memberof ResolveContext
     */
    get token(): Token<T> {
        return this.getValue(CTX_TOKEN);
    }

    get default(): Token<T> {
        return this.getValue(CTX_DEFAULT_TOKEN);
    }

    /**
     * reslove result instance.
     *
     * @type {*}
     * @memberof IResolveContext
     */
    instance?: T;

    /**
     * create resolve context via options.
     *
     * @static
     * @param {IInjector} injector
     * @param {ResolveActionOption} options
     * @returns {ResolveActionContext}
     * @memberof ResolveActionContext
     */
    static parse<T>(injector: IInjector, options: ResolveActionOption<T>): ResolveActionContext<T> {
        return createRaiseContext<ResolveActionContext>(injector, ResolveActionContext, options);
    }

    setOptions(options: TOP) {
        if (!options) {
            return;
        }
        super.setOptions(options);
        if (options.token) {
            this.context.registerValue(CTX_TOKEN, options.token);
        }
        if (options.default) {
            this.context.registerValue(CTX_DEFAULT_TOKEN, options.default);
        }
    }
}
