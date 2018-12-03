import {
    IContainer, LoadType, Factory, Token,
    ContainerBuilder, IContainerBuilder, isClass,
    isToken, InjectReference, PromiseUtil, Injectable, lang, RefTokenType
} from '@ts-ioc/core';
import { IRunnableBuilder, CustomRegister, RunnableBuilderToken } from './IRunnableBuilder';
import {
    ModuleBuilder, ModuleEnv, DIModuleInjectorToken,
    InjectedModule, IModuleBuilder, InjectModuleBuilderToken,
    ModuleBuilderToken, ModuleConfig, ModuleConfigure
} from '../modules';
import { ContainerPool, ContainerPoolToken, Events, IEvents } from '../utils';
import { BootModule } from '../BootModule';
import { Runnable } from '../runnable';
import { ConfigureMgrToken, IConfigureManager } from './IConfigureManager';

/**
 * runnable events
 *
 * @export
 * @enum {number}
 */
export enum RunnableEvents {
    /**
     * on root container created.
     */
    onRootContainerCreated = 'onRootContainerCreated',
    /**
     * on root container inited.
     */
    onRootContainerInited = 'onRootContainerInited',
    /**
     * on module created.
     */
    onModuleCreated = 'onModuleCreated',
    /**
     * on boot created.
     */
    onBootCreated = 'onBootCreated',
    /**
     *  on runable service started.
     */
    onRunnableStarted = 'onRunnableStarted'
}


/**
 * runnable builder.
 *
 * @export
 * @class RunnableBuilder
 * @extends {ModuleBuilder}
 * @template T
 */
@Injectable(RunnableBuilderToken)
export class RunnableBuilder<T> extends ModuleBuilder<T> implements IRunnableBuilder<T>, IEvents {

    protected globalModules: LoadType[];
    protected customRegs: CustomRegister<T>[];
    protected beforeInitPds: Map<Token<any>, any>;
    protected afterInitPds: Map<Token<any>, any>;
    protected configMgr: IConfigureManager<ModuleConfig<T>>;
    inited = false;

    events: Events;

    constructor(public baseURL?: string) {
        super();
        this.customRegs = [];
        this.globalModules = [];
        this.beforeInitPds = new Map();
        this.afterInitPds = new Map();
        this.events = new Events();
        this.initEvents();
    }

    protected initEvents() {
        this.on(RunnableEvents.onRootContainerInited, (container) => {
            this.afterInitPds.forEach((val, key) => {
                container.bindProvider(key, val);
            });
        })
    }

    on(name: string, event: (...args: any[]) => void): this {
        this.events.on(name, event);
        return this;
    }
    off(name: string, event?: (...args: any[]) => void): this {
        this.events.off(name, event);
        return this;
    }
    emit(name: string, ...args: any[]): void {
        this.events.emit(name, ...args);
    }

    getPools(): ContainerPool {
        if (!this.pools) {
            this.pools = new ContainerPool(this.createContainerBuilder());
            this.createDefaultContainer();
        }
        return this.pools;
    }

    protected createContainerBuilder(): IContainerBuilder {
        return new ContainerBuilder();
    }

    /**
     * use module as global Depdences module.
     *
     * @param {...LoadType[]} modules
     * @returns {this}
     * @memberof RunnableBuilder
     */
    use(...modules: LoadType[]): this {
        this.globalModules = this.globalModules.concat(modules);
        this.inited = false;
        return this;
    }

    /**
     * bind provider
     *
     * @template T
     * @param {Token<T>} provide
     * @param {Token<T> | Factory<T>} provider
     * @param {boolean} [beforRootInit]
     * @returns {this}
     * @memberof RunnableBuilder
     */
    provider(provide: Token<any>, provider: Token<any> | Factory<any>, beforRootInit?: boolean): this {
        if (beforRootInit) {
            this.beforeInitPds.set(provide, provider);
        } else {
            this.afterInitPds.set(provide, provider);
        }
        return this;
    }

    async load(token: Token<T> | ModuleConfigure, env?: ModuleEnv): Promise<InjectedModule<T>> {
        await this.initRootContainer();
        return await super.load(token, env);
    }

    async build(token: Token<T> | ModuleConfigure, env?: ModuleEnv, data?: any): Promise<T> {
        let injmdl = await this.load(token, env);
        let builder = this.getBuilder(injmdl);
        let md = await builder.build(token, injmdl, data);
        this.emit(RunnableEvents.onModuleCreated, md, token);
        return md;
    }

    async bootstrap(token: Token<T> | ModuleConfigure, env?: ModuleEnv, data?: any): Promise<Runnable<T>> {
        let injmdl = await this.load(token, env);
        let builder = this.getBuilder(injmdl);
        return await builder.bootstrap(token, injmdl, data);
    }

    async run(token: Token<T> | ModuleConfigure, env?: ModuleEnv, data?: any): Promise<Runnable<T>> {
        return await this.bootstrap(token, env, data);
    }

    /**
     * get module builder
     *
     * @param {(Token<T> | ModuleConfig<T>)} token
     * @param {ModuleEnv} [env]
     * @returns {IModuleBuilder<T>}
     * @memberof RunnableBuilder
     */
    async getBuilderByConfig(token: Token<T> | ModuleConfig<T>, env?: ModuleEnv): Promise<IModuleBuilder<T>> {
        let injmdl = await this.load(token, env);
        return this.getBuilder(injmdl)
    }

    getBuilder(injmdl: InjectedModule<T>): IModuleBuilder<T> {
        let cfg = injmdl.config;
        let container = injmdl.container;
        let builder: IModuleBuilder<T>;
        if (cfg) {
            if (isClass(cfg.builder)) {
                if (!container.has(cfg.builder)) {
                    container.register(cfg.builder);
                }
            }
            if (isToken(cfg.builder)) {
                builder = container.resolve(cfg.builder);
            } else if (cfg.builder instanceof ModuleBuilder) {
                builder = cfg.builder;
            }
        }

        let tko = injmdl.token;
        if (!builder && tko) {
            builder = container.getRefService(
                this.getRefBuilderTokens(container),
                tko, ModuleBuilderToken);
        }

        return builder || this;
    }

    protected getRefBuilderTokens(container: IContainer): RefTokenType<any>[] {
        return [
            { service: RunnableBuilderToken, isPrivate: true },
            { service: ModuleBuilderToken, isPrivate: true },
            (tk) => new InjectModuleBuilderToken(tk),
            (tk) => new InjectReference(RunnableBuilderToken, tk),
            (tk) => new InjectReference(RunnableBuilder, tk),
            (tk) => new InjectReference(ModuleBuilderToken, tk),
            (tk) => new InjectReference(ModuleBuilder, tk)
        ]
    }

    getConfigManager(): IConfigureManager<ModuleConfig<T>> {
        if (!this.configMgr) {
            this.configMgr = this.createConfigureMgr();
        }
        return this.configMgr;
    }

    protected createConfigureMgr() {
        return this.getPools().getDefault().getService(ConfigureMgrToken, lang.getClass(this), { baseURL: this.baseURL });
    }

    protected async autoRun(container: IContainer, token: Token<any>, cfg: ModuleConfig<T>, instance: any, data?: any): Promise<Runnable<T>> {
        this.emit(RunnableEvents.onBootCreated, instance, token);
        let runnable = await super.autoRun(container, token, cfg, instance, data);
        this.emit(RunnableEvents.onRunnableStarted, runnable, instance, token);
        return runnable;
    }

    protected createDefaultContainer() {
        let container = this.pools.getDefault();
        container.register(BootModule);

        let chain = container.getBuilder().getInjectorChain(container);
        chain.first(container.resolve(DIModuleInjectorToken));
        container.bindProvider(ContainerPoolToken, () => this.getPools());

        this.beforeInitPds.forEach((val, key) => {
            container.bindProvider(key, val);
        });

        this.events.emit(RunnableEvents.onRootContainerCreated, container);
        return container;
    }

    protected async initRootContainer() {
        if (this.inited) {
            return;
        }
        let container = this.getPools().getDefault();
        await this.registerExts(container);
        let configManager = this.getConfigManager();
        let config = await configManager.getConfig();
        await this.registerByConfigure(container, config);
        await configManager.bindBuilder(this);
        this.inited = true;
        this.events.emit(RunnableEvents.onRootContainerInited, container);
    }

    /**
     * register ioc exts
     *
     * @protected
     * @param {IContainer} container
     * @param {AppConfigure} config
     * @memberof RunnableBuilder
     */
    protected async registerExts(container: IContainer): Promise<void> {
        if (this.globalModules.length) {
            let usedModules = this.globalModules;
            await container.loadModule(...usedModules);
        }
    }

    /**
     * register by configure.
     *
     * @protected
     * @param {IContainer} container
     * @param {ModuleConfig<T>} config
     * @returns {Promise<void>}
     * @memberof RunnableBuilder
     */
    protected async registerByConfigure(container: IContainer, config: ModuleConfig<T>): Promise<void> {
        if (this.baseURL) {
            config.baseURL = this.baseURL;
        }
        await PromiseUtil.step(this.customRegs.map(async cs => {
            let tokens = await cs(container, config, this);
            return tokens;
        }));
    }
}
