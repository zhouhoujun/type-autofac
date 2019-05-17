import { IocCoreService, Type, Inject, Singleton, isClass, Autorun, ProviderTypes, isFunction } from '@tsdi/ioc';
import { BootContext, BootOption, BootTargetToken } from '../BootContext';
import { IContainer, ContainerToken, isContainer } from '@tsdi/core';
import { CompositeHandle, HandleRegisterer, RegScope, TemplateManager } from '../core';
import { IBootApplication } from '../IBootApplication';
import { ModuleBuilderLifeScope } from './ModuleBuilderLifeScope';
import { ResolveMoudleScope, IModuleResolveOption, BuildContext } from './resovers';
import { RunnableBuildLifeScope } from './RunnableBuildLifeScope';
import { BootLifeScope } from './BootLifeScope';



/**
 * service run runnable module.
 *
 * @export
 * @class BuilderService
 * @extends {IocCoreService}
 */
@Singleton()
@Autorun('setup')
export class BuilderService extends IocCoreService {

    @Inject(ContainerToken)
    protected container: IContainer;

    setup() {
        this.container.get(HandleRegisterer)
            .register(this.container, ResolveMoudleScope, true)
            .register(this.container, ModuleBuilderLifeScope, true)
            .register(this.container, RunnableBuildLifeScope, true)
            .register(this.container, BootLifeScope, true);
    }

    /**
     * binding resolve.
     *
     * @template T
     * @param {Type<any>} target
     * @param {IModuleResolveOption} options
     * @param {(IContainer | ProviderTypes)} [container]
     * @param {...ProviderTypes[]} providers
     * @returns {Promise<T>}
     * @memberof BuilderService
     */
    async resolve<T>(target: Type<any>, options: IModuleResolveOption, container?: IContainer | ProviderTypes, ...providers: ProviderTypes[]): Promise<T> {
        let rctx = await this.resolveModule(target, options, container, ...providers);
        return rctx.target;
    }

    protected async resolveModule<T>(target: Type<any>, options: IModuleResolveOption, container?: IContainer | ProviderTypes, ...providers: ProviderTypes[]): Promise<BuildContext> {
        let raiseContainer: IContainer;
        if (isContainer(container)) {
            raiseContainer = container;
        } else {
            providers.unshift(container as ProviderTypes);
            raiseContainer = this.container;
        }
        let rctx = BuildContext.parse(target, options, raiseContainer);
        if (providers.length) {
            rctx.providers = (rctx.providers || []).concat(providers);
        }
        await this.container.get(HandleRegisterer)
            .get(ResolveMoudleScope)
            .execute(rctx);
        return rctx;
    }

    /**
     * resolve component ify.
     *
     * @template T
     * @param {Type<any>} target
     * @param {IModuleResolveOption} options
     * @param {(IContainer | ProviderTypes)} [container]
     * @param {...ProviderTypes[]} providers
     * @returns {Promise<T>}
     * @memberof BuilderService
     */
    async resolveCompoent<T>(target: Type<any>, options: IModuleResolveOption, container?: IContainer | ProviderTypes, ...providers: ProviderTypes[]): Promise<T> {
        let rctx = await this.resolveModule(target, options, container, ...providers);
        let mgr = rctx.getRaiseContainer().get(TemplateManager);
        return mgr.has(rctx.target) ? mgr.get(rctx.target) : rctx.target;
    }

    async create<T extends BootContext>(target: Type<any> | BootOption | T, ...args: string[]): Promise<any> {
        let ctx = await this.build(target, ...args);
        return ctx.target;
    }

    async createBoot<T extends BootContext>(target: Type<any> | BootOption | T, ...args: string[]): Promise<any> {
        let ctx = await this.build(target, ...args);
        return ctx.getBootTarget();
    }

    /**
     * build module.
     *
     * @template T
     * @param {(Type<any> | T)} target
     * @param {...string[]} args
     * @returns {Promise<T>}
     * @memberof BuilderService
     */
    build<T extends BootContext>(target: Type<any> | BootOption | T, ...args: string[]): Promise<T> {
        return this.execLifeScope(null, this.container.get(HandleRegisterer).get(ModuleBuilderLifeScope), target, ...args);
    }

    /**
     * run module.
     *
     * @template T
     * @param {(Type<any> | T)} target
     * @param {...string[]} args
     * @returns {Promise<T>}
     * @memberof RunnerService
     */
    run<T extends BootContext>(target: Type<any> | BootOption | T, ...args: string[]): Promise<T> {
        return this.execLifeScope(null, this.container.get(HandleRegisterer).get(RunnableBuildLifeScope), target, ...args);
    }

    /**
     * boot application.
     *
     * @template T
     * @param {(Type<any> | BootOption | T)} target
     * @param {...string[]} args
     * @returns {Promise<T>}
     * @memberof BuilderService
     */
    async boot(application: IBootApplication, ...args: string[]): Promise<BootContext> {
        await this.container.load(...application.getBootDeps());
        return await this.execLifeScope(application, this.container.get(HandleRegisterer).get(BootLifeScope), application.target, ...args);
    }

    protected async execLifeScope<T extends BootContext>(application: IBootApplication, scope: CompositeHandle<BootContext>, target: Type<any> | BootOption | T, ...args: string[]): Promise<T> {
        let ctx: BootContext;
        if (target instanceof BootContext) {
            ctx = target;
            if (!ctx.hasRaiseContainer()) {
                ctx.setRaiseContainer(this.container);
            }
        } else {
            let md = isClass(target) ? target : target.module;
            ctx = this.container.getService(BootContext, md, { provide: BootTargetToken, useValue: md });
            if (!isClass(target)) {
                ctx.setOptions(target);
            }
        }

        ctx.args = args;
        if (application) {
            ctx.regScope = RegScope.boot;
            if (isFunction(application.onContextInit)) {
                application.onContextInit(ctx);
            }
        }
        await scope.execute(ctx);
        return ctx as T;
    }
}
