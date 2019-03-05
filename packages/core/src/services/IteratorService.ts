import {
    IocCoreService, isClassType, Token,
    ClassType, InstanceFactory, ParamProviders, IResolver,
    isToken, lang, isFunction, isArray, isBoolean,
    isClass, isAbstractClass, InjectReference, ProviderMap, IIocContainer
} from '@ts-ioc/ioc';

export class IteratorService extends IocCoreService {
    constructor(private container: IIocContainer) {
        super();
    }

    /**
     * get all service extends type and reference target.
     *
     * @template T
     * @param {(tk: ClassType<T>, fac: InstanceFactory<T>, resolvor?: IResolver, ...providers: ParamProviders[]) => void | boolean} express
     * @param {(Token<T> | ((token: ClassType<T>) => boolean))} type servive token or express match token.
     * @param {(Token<any> | Token<any>[])} [target] service refrence target.
     * @param {(boolean|ParamProviders)} [both]
     * @param {(boolean|ParamProviders)} [both] get services bubble up to parent container.
     * @param {...ParamProviders[]} providers
     * @returns {T}
     * @memberof IContainer
     */
    each<T>(
        express: (tk: ClassType<T>, fac: InstanceFactory<T>, resolvor?: IResolver, ...providers: ParamProviders[]) => void | boolean,
        token: Token<T> | ((token: ClassType<T>) => boolean),
        target?: Token<any> | Token<any>[] | ParamProviders,
        both?: boolean | ParamProviders,
        ...providers: ParamProviders[]): void {

        let withTag: boolean;
        let withBoth = false;
        let matchExp: (token: ClassType<T>) => boolean;
        if (isToken(token)) {
            let type = isClassType(token) ? token : this.container.getTokenProvider(token);
            matchExp = (tk) => lang.isExtendsClass(tk, type);
        } else if (isFunction(token)) {
            matchExp = token;
        }

        if (isToken(target) || isArray(target)) {
            withTag = true;
            if (isBoolean(both)) {
                withBoth = both;
            } else {
                providers.unshift(both);
            }
            let tags: ClassType<any>[] = (isArray(target) ? target : [target]).map(t => {
                if (isClass(t)) {
                    return t;
                } else if (isAbstractClass(t)) {
                    return t;
                } else {
                    return this.container.getTokenProvider(t);
                }
            });

            // target private service.
            this.eachTarget(tags, express, matchExp, ...providers);

        } else {
            providers.unshift(target);
            withTag = false;
        }
        if (!withTag || (withTag && withBoth)) {
            this.container.iterator((fac, tk, resolver) => {
                if (isClassType(tk) && matchExp(tk)) {
                    return express(tk, fac, resolver, ...providers);
                }
            });
        }
    }

    eachTarget<T>(
        tags: ClassType<any>[],
        express: (tk: ClassType<T>, fac: InstanceFactory<T>, resolvor?: IResolver, ...providers: ParamProviders[]) => void | boolean,
        matchExp: (token: ClassType<T>) => boolean,
        ...providers: ParamProviders[]) {
        tags.some(tg => {
            let priMapTk = new InjectReference(ProviderMap, tg);
            if (this.container.has(priMapTk)) {
                let priMap = this.container.resolve(priMapTk);
                return priMap.keys().some(ptk => {
                    if (isClassType(ptk) && matchExp(ptk)) {
                        return express(ptk, priMap.get(ptk), priMap, ...providers) !== false;
                    }
                    return false;
                });
            }
            return false;
        });
    }
}
