import {
    IocCoreService, Singleton,
    Token, IResolver, ProviderTypes
} from '@ts-ioc/ioc';
import { IModuleResolver } from '../modules';

@Singleton
export class DIModuleExports extends IocCoreService implements IResolver {

    /**
    * resolvers
    *
    * @protected
    * @type {IModuleResolver[]}
    * @memberof ResolverChain
    */
    protected resolvers: IModuleResolver[];

    constructor() {
        super();
        this.resolvers = [];
    }

    has<T>(key: Token<T>, alias?: string): boolean {
        return this.resolvers.some(r => r.has(key, alias));
    }

    resolve<T>(token: Token<T>, ...providers: ProviderTypes[]): T {
        let inst: T;
        this.resolvers.some(r => {
            let resover = this.getRegResolver(r, token);
            if (resover) {
                inst = resover.resolve(token, ...providers);
            }
            return !!inst;
        });
        return inst || null;
    }

    getRegResolver<T>(resolver: IModuleResolver, token: Token<T>) {
        let r;
        if (resolver.has(token)) {
            r = resolver;
        } else {
            resolver.getContainer().resolve(DIModuleExports)
                .getResolvers().some(sr => {
                    r = this.getRegResolver(sr, token)
                    return !!r;
                })
        }
        return r;
    }

    unregister<T>(token: Token<T>): this {
        this.resolvers.forEach(r => {
            r.unregister(token);
        });
        return this;
    }


    /**
     * get resolvers.
     *
     * @returns {IResolverContainer[]}
     * @memberof DIModuleExports
     */
    getResolvers(): IModuleResolver[] {
        return this.resolvers;
    }

    /**
     * reigister next resolver.
     *
     * @param {IModuleResolver} resolver
     * @param {boolean} [first]
     * @returns {this}
     * @memberof ExportResolvers
     */
    use(resolver: IModuleResolver, first?: boolean): this {
        if (this.hasResolver(resolver)) {
            return this;
        }
        if (first) {
            this.resolvers.unshift(resolver);
        } else {
            this.resolvers.push(resolver);
        }
        return this;
    }

    /**
     * has resolver or not.
     *
     * @param {IModuleResolver} resolver
     * @returns
     * @memberof ResolverChain
     */
    hasResolver(resolver: IModuleResolver): boolean {
        return this.resolvers.indexOf(resolver) >= 0;
    }

}
