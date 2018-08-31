import { AppConfigure, AppConfigureToken, DefaultConfigureToken, AppConfigureLoaderToken } from './AppConfigure';
import { IContainer, LoadType, lang, isString, MapSet, Factory, Token, isUndefined, DefaultContainerBuilder, IContainerBuilder, isClass, isToken } from '@ts-ioc/core';
import { IApplicationBuilder, CustomRegister, AnyApplicationBuilder } from './IApplicationBuilder';
import { ModuleBuilder, ModuleEnv, DIModuleInjectorToken, InjectedModule, IModuleBuilder, InjectModuleBuilderToken, DefaultModuleBuilderToken, ModuleBuilderToken, ModuleConfig } from '../modules';
import { ContainerPool, ContainerPoolToken, Events, IEvents } from '../utils';
import { BootModule } from '../BootModule';
import { Runnable } from '../runnable';

export enum ApplicationEvents {
    onRootContainerCreated = 'onRootContainerCreated',
    onRootContainerInited = 'onRooConatianerInited'
}

/**
 * application builder.
 *
 * @export
 * @class Default ApplicationBuilder
 * @extends {ModuleBuilder}
 * @template T
 */
export class DefaultApplicationBuilder<T> extends ModuleBuilder<T> implements IApplicationBuilder<T>, IEvents {

    private globalConfig: AppConfigure;
    protected globalModules: LoadType[];
    protected customRegs: CustomRegister<T>[];
    protected beforeInitPds: MapSet<Token<any>, any>;
    protected afterInitPds: MapSet<Token<any>, any>;
    protected configs: (string | AppConfigure)[];
    inited = false;

    events: Events;

    constructor(public baseURL?: string) {
        super();
        this.customRegs = [];
        this.globalModules = [];
        this.configs = [];
        this.beforeInitPds = new MapSet();
        this.afterInitPds = new MapSet();
        this.events = new Events();
        this.initEvents();
    }

    protected initEvents() {
        this.events.on('onRooConatianerInited', (container) => {
            this.afterInitPds.forEach((val, key) => {
                container.bindProvider(key, val);
            });
        })
    }

    static create(baseURL?: string): AnyApplicationBuilder {
        return new DefaultApplicationBuilder<any>(baseURL);
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
        return new DefaultContainerBuilder();
    }

    /**
     * use configuration.
     *
     * @param {(string | AppConfigure)} [config]
     * @returns {this} global config for this application.
     * @memberof Bootstrap
     */
    useConfiguration(config?: string | AppConfigure): this {
        if (isUndefined(config)) {
            config = '';
        }
        // clean cached config.
        this.globalConfig = null;
        let idx = this.configs.indexOf(config);
        if (idx >= 0) {
            this.configs.splice(idx, 1);
        }
        this.configs.push(config);

        return this;
    }

    protected loadConfig(container: IContainer, src: string): Promise<AppConfigure> {
        if (container.has(AppConfigureLoaderToken)) {
            let loader = container.resolve(AppConfigureLoaderToken, { baseURL: this.baseURL, container: container });
            return loader.load(src);
        } else if (src) {
            let builder = container.getBuilder();
            return builder.loader.load([src])
                .then(rs => {
                    return rs.length ? rs[0] as AppConfigure : null;
                })
        } else {
            return Promise.resolve(null);
        }

    }

    /**
     * use module as global Depdences module.
     *
     * @param {...LoadType[]} modules
     * @returns {this}
     * @memberof PlatformServer
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
     * @memberof IContainer
     */
    provider(provide: Token<any>, provider: Token<any> | Factory<any>, beforRootInit?: boolean): this {
        if (beforRootInit) {
            this.beforeInitPds.set(provide, provider);
        } else {
            this.afterInitPds.set(provide, provider);
        }
        return this;
    }

    protected async load(token: Token<T> | AppConfigure, env?: ModuleEnv): Promise<InjectedModule<T>> {
        await this.initRootContainer();
        return super.load(token, env);
    }

    async build(token: Token<T> | AppConfigure, env?: ModuleEnv, data?: any): Promise<T> {
        let injmdl = await this.load(token, env);
        let builder = this.getBuilderByModule(injmdl);
        return await builder.build(token, injmdl, data);
    }

    async bootstrap(token: Token<T> | AppConfigure, env?: ModuleEnv, data?: any): Promise<Runnable<T>> {
        let injmdl = await this.load(token, env);
        let builder = this.getBuilderByModule(injmdl);
        return await builder.bootstrap(token, injmdl, data);
    }

    /**
     * get module builder
     *
     * @param {(Token<T> | ModuleConfig<T>)} token
     * @param {ModuleEnv} [env]
     * @returns {IModuleBuilder<T>}
     * @memberof IApplicationBuilder
     */
    async getBuilder(token: Token<T> | ModuleConfig<T>, env?: ModuleEnv): Promise<IModuleBuilder<T>> {
        let injmdl = await this.load(token, env);
        return this.getBuilderByModule(injmdl)
    }

    getBuilderByModule(injmdl: InjectedModule<T>): IModuleBuilder<T> {
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
            container.getTokenExtendsChain(tko).forEach(tk => {
                if (builder) {
                    return false;
                }
                let buildToken = new InjectModuleBuilderToken<T>(tk);
                if (container.has(buildToken)) {
                    builder = container.get(buildToken);
                }
                return true;
            });
        }
        if (!builder) {
            builder = this.getDefaultBuilder(container);
        }

        return builder || this;
    }

    protected getDefaultBuilder(container: IContainer): IModuleBuilder<any> {
        if (container.has(DefaultModuleBuilderToken)) {
            return container.resolve(DefaultModuleBuilderToken);
        }
        return container.resolve(ModuleBuilderToken);
    }


    protected async getGlobalConfig(container: IContainer): Promise<AppConfigure> {
        if (!this.globalConfig) {
            let globCfg = await this.getDefaultConfig(container);
            if (this.configs.length < 1) {
                this.configs.push(''); // load default loader config.
            }
            let exts = await Promise.all(this.configs.map(cfg => {
                if (isString(cfg)) {
                    return this.loadConfig(container, cfg);
                } else {
                    return cfg;
                }
            }));
            exts.forEach(exCfg => {
                if (exCfg) {
                    lang.assign(globCfg, exCfg);
                }
            });
            this.globalConfig = globCfg;
        }
        return this.globalConfig;
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

        this.events.emit(ApplicationEvents.onRootContainerCreated, container);
        return container;
    }

    protected async initRootContainer(container?: IContainer) {
        if (this.inited) {
            return;
        }
        container = container || this.getPools().getDefault();
        let globCfg = await this.getGlobalConfig(container);
        await this.registerExts(container, globCfg);
        this.bindAppConfig(globCfg);
        container.bindProvider(AppConfigureToken, globCfg);
        this.inited = true;
        this.events.emit(ApplicationEvents.onRootContainerInited, container);
    }

    /**
     * register ioc exts
     *
     * @protected
     * @param {IContainer} container
     * @param {AppConfigure} config
     * @returns {Promise<IContainer>}
     * @memberof ApplicationBuilder
     */
    protected async registerExts(container: IContainer, config: AppConfigure): Promise<IContainer> {

        if (this.globalModules.length) {
            let usedModules = this.globalModules;
            await container.loadModule(...usedModules);
        }

        if (this.customRegs.length) {
            await Promise.all(this.customRegs.map(async cs => {
                let tokens = await cs(container, config, this);
                return tokens;
            }));
        }

        return container;
    }

    protected bindAppConfig(config: AppConfigure): AppConfigure {
        if (this.baseURL) {
            config.baseURL = this.baseURL;
        }
        return config;
    }

    protected async getDefaultConfig(container: IContainer): Promise<AppConfigure> {
        if (container.has(DefaultConfigureToken)) {
            return container.resolve(DefaultConfigureToken);
        } else {
            return {} as AppConfigure;
        }
    }

}
