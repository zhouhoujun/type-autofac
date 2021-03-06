import { IocCoreService, IInjector, Token, Provider, isToken, IProvider, INJECTOR, InjectorProxyToken, PROVIDERS, InjectorProxy, Type, ActionInjectorToken, isArray, lang } from '@tsdi/ioc';
import { ServiceOption, ServiceContext, ServicesOption, ServicesContext } from '../resolves/context';
import { ResolveServiceScope, ResolveServicesScope } from '../resolves/actions';
import { IServiceResolver } from './IServiceResolver';
import { IServicesResolver } from './IServicesResolver';
import { IContainer } from '../IContainer';

export class ServiceProvider extends IocCoreService implements IServiceResolver, IServicesResolver {

    private serviceScope: ResolveServiceScope;
    private servicesScope: ResolveServicesScope;
    constructor(private proxy: InjectorProxy<IContainer>) {
        super();
    }

    /**
     *  get service or target reference service.
     *
     * @template T
     * @param {(Token<T> | ServiceOption<T>)} target
     * @param {...Provider[]} providers
     * @returns {T}
     * @memberof Container
     */
    getService<T>(injector: IInjector, target: Token<T> | ServiceOption<T>, ...providers: Provider[]): T {
        let context = {
            injector,
            ...isToken(target) ? { token: target } : target
        } as ServiceContext;
        if (isArray(context.providers)) {
            context.providers = injector.get(PROVIDERS).inject(...context.providers);
        } else {
            context.providers = injector.get(PROVIDERS);
        }
        let pdr = context.providers;
        providers.length && pdr.inject(...providers);
        this.initTargetRef(context);
        if (!pdr.hasTokenKey(INJECTOR)) {
            pdr.inject(
                { provide: INJECTOR, useValue: injector },
                { provide: InjectorProxyToken, useValue: injector.getProxy() }
            );
        }

        if (!this.serviceScope) {
            this.serviceScope = this.proxy()
                .getActionInjector()
                .getInstance(ResolveServiceScope);
        }

        this.serviceScope.execute(context);
        const instance = context.instance;
        // clean obj.
        lang.cleanObj(context);
        return instance || null;
    }

    /**
     * get all service extends type.
     *
     * @template T
     * @param {(Token<T> | ServicesOption<T>)} target servive token or express match token.
     * @param {...Provider[]} providers
     * @returns {T[]} all service instance type of token type.
     * @memberof IContainer
     */
    getServices<T>(injector: IInjector, target: Token<T> | ServicesOption<T>, ...providers: Provider[]): T[] {
        let maps = this.getServiceProviders(injector, target);
        let services = [];
        let pdr = injector.get(PROVIDERS).inject(...providers);
        if (!pdr.hasTokenKey(INJECTOR)) {
            pdr.inject(
                { provide: INJECTOR, useValue: injector },
                { provide: InjectorProxyToken, useValue: injector.getProxy() });
        }
        maps.iterator((fac) => {
            services.push(fac(pdr));
        });
        return services;
    }

    /**
     * get service providers.
     *
     * @template T
     * @param {IInjector} injector
     * @param {Token<T> | ServicesOption<T>} target
     * @returns {IProvider}
     */
    getServiceProviders<T>(injector: IInjector, target: Token<T> | ServicesOption<T>): IProvider {
        let context = {
            injector,
            ...isToken(target) ? { token: target } : target
        } as ServicesContext;
        if (isArray(context.providers)) {
            context.providers = injector.get(PROVIDERS).inject(...context.providers);
        } else {
            context.providers = injector.get(PROVIDERS);
        }
        this.initTargetRef(context);
        if (!this.servicesScope) {
            this.servicesScope = this.proxy()
                .getActionInjector()
                .getInstance(ResolveServicesScope);
        }
        this.servicesScope.execute(context);
        const services = context.services;
        // clean obj.
        lang.cleanObj(context);
        return services;
    }

    private initTargetRef(ctx: ServiceContext) {
        let targets = (isArray(ctx.target) ? ctx.target : [ctx.target]).filter(t => t);
        if (targets.length) {
            ctx.targetRefs = targets;
        }
        let tokens = ctx.tokens || [];
        if (tokens.length) {
            tokens = tokens.filter(t => t).map(t => ctx.injector.getToken(t, ctx.alias));
        }
        if (ctx.token) {
            tokens.unshift(ctx.injector.getToken(ctx.token, ctx.alias));
        }
        ctx.tokens = tokens;
        ctx.reflects = this.proxy().getTypeReflects();
    }
}
