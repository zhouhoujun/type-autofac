import { ActionContextOption, IocActionContext } from './Action';
import { ProviderTypes } from '../providers';
import { Token, Type } from '../types';
import { IIocContainer } from '../IIocContainer';
import { isClass, isToken } from '../utils';


/**
 * resovle action option.
 *
 * @export
 * @interface ResolveActionOption
 */
export interface ResolveActionOption<T> extends ActionContextOption {
    /**
     * token.
     *
     * @type {Token<T>}
     * @memberof ResolveActionOption
     */
    token?: Token<T>;
    /**
     * resolver providers.
     *
     * @type {ParamProviders[]}
     * @memberof IResolveContext
     */
    providers?: ProviderTypes[];
}

export function createResolveContext<T, Ctx extends ResolveActionContext<T>>(CtxType: Type<Ctx>, target: Token<T> | ResolveActionOption<T>, raiseContainer?: IIocContainer | (() => IIocContainer)): Ctx {
    let token: Token<any>;
    let options: ResolveActionOption<T>;
    if (isToken(target)) {
        token = target;
    } else {
        options = target;
        token = target.token;
    }
    let ctx = new CtxType(token, raiseContainer);
    options && ctx.setOptions(options);
    return ctx;
}

/**
 * resolve action context.
 *
 * @export
 * @interface IResolverContext
 */
export class ResolveActionContext<T> extends IocActionContext {

    constructor(token: Token<T>, raiseContainer?: IIocContainer | (() => IIocContainer)){
        super(raiseContainer);
        this.token = token
    }

    /**
     * token.
     *
     * @type {Token<any>}
     * @memberof ResolveContext
     */
    token: Token<T>;

    /**
     * resolver providers.
     *
     * @type {ParamProviders[]}
     * @memberof IResolveContext
     */
    providers: ProviderTypes[];
    /**
     * reslove result instance.
     *
     * @type {*}
     * @memberof IResolveContext
     */
    instance?: T;


    /**
     * set resolve target.
     *
     * @param {Token<any>} token
     * @param {ProviderTypes[]} [providers]
     * @memberof ResolveContext
     */
    setOptions<T>(options: ResolveActionOption<T>) {
        super.setOptions(options);
    }

    /**
     * create resolve context via options.
     *
     * @static
     * @param {ResolveActionOption} [options]
     * @param {(IIocContainer | (() => IIocContainer))} [raiseContainer]
     * @returns {ResolveActionContext}
     * @memberof ResolveActionContext
     */
    static parse<T>(target?: Token<T> | ResolveActionOption<T>, raiseContainer?: IIocContainer | (() => IIocContainer)): ResolveActionContext<T> {
        return createResolveContext(ResolveActionContext, target, raiseContainer);
    }
}
