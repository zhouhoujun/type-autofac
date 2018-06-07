import { AppConfiguration, AppConfigurationToken } from './AppConfiguration';
import { IModuleBuilder, ModuleBuilderToken } from './IModuleBuilder';
import { Token, Type, LoadType } from './types';
import { lang, isString, isClass, isFunction, isToken } from './utils/index';
import { IContainer } from './IContainer';
import { IContainerBuilder, ContainerBuilderToken } from './IContainerBuilder';
import { DefaultContainerBuilder } from './DefaultContainerBuilder';
import { CustomRegister, IApplicationBuilder } from './IApplicationBuilder';

/**
 * application builder.
 *
 * @export
 * @class ApplicationBuilder
 * @extends {ModuleBuilder<T>}
 * @template T
 */
export class ApplicationBuilder<T> implements IApplicationBuilder<T> {
    private moduleBuilder: IModuleBuilder<T>;
    private container: IContainer;
    private builder: IContainerBuilder;
    protected configuration: Promise<AppConfiguration<T>>;
    protected usedModules: LoadType[];
    protected customRegs: CustomRegister<T>[];
    constructor(public baseURL?: string) {
        this.usedModules = [];
        this.customRegs = [];
    }


    /**
     * get container
     *
     * @returns
     * @memberof ApplicationBuilder
     */
    getContainer(): IContainer {
        if (!this.container) {
            this.container = this.getContainerBuilder().create();
        }
        return this.container;
    }

    /**
     * set container.
     *
     * @param {IContainer} container
     * @returns
     * @memberof ApplicationBuilder
     */
    setContainer(container: IContainer) {
        if (container) {
            this.container = container;
            this.builder = container.get(ContainerBuilderToken);
        }
        return this;
    }

    /**
     * get container builder.
     *
     * @returns
     * @memberof ModuleBuilder
     */
    getContainerBuilder(): IContainerBuilder {
        if (!this.builder) {
            this.builder = this.createContainerBuilder();
        }
        return this.builder;
    }

    /**
     * use container builder
     *
     * @param {IContainerBuilder} builder
     * @returns
     * @memberof ModuleBuilder
     */
    setContainerBuilder(builder: IContainerBuilder) {
        this.builder = builder;
        this.container = null;
        return this;
    }


    /**
     * get module builer.
     *
     * @returns {IModuleBuilder<T>}
     * @memberof IApplicationBuilder
     */
    getModuleBuilder(): IModuleBuilder<T> {
        if (!this.moduleBuilder) {
            this.moduleBuilder = this.createModuleBuilder();
        }
        return this.moduleBuilder;
    }

    /**
     * set module builder.
     *
     * @param {IModuleBuilder<T>} builder
     * @returns {this}
     * @memberof ApplicationBuilder
     */
    setModuleBuilder(builder: IModuleBuilder<T>): this {
        this.moduleBuilder = builder;
        return this;
    }

    /**
     * use custom configuration.
     *
     * @param {(string | AppConfiguration<T>)} [config]
     * @returns {this}
     * @memberof Bootstrap
     */
    useConfiguration(config?: string | AppConfiguration<T>): this {
        if (!this.configuration) {
            this.configuration = Promise.resolve(this.getDefaultConfig());
        }
        let pcfg: Promise<AppConfiguration<T>>;
        let builder = this.getContainerBuilder();
        if (isString(config)) {
            pcfg = builder.loader.load(config)
                .then(rs => {
                    return rs.length ? rs[0] as T : null;
                })
        } else if (config) {
            pcfg = Promise.resolve(config);
        }

        if (pcfg) {
            this.configuration = this.configuration
                .then(cfg => {
                    return pcfg.then(rcfg => {
                        let excfg = (rcfg['default'] ? rcfg['default'] : rcfg) as T;
                        cfg = lang.assign(cfg || {}, excfg || {}) as T;
                        return cfg;
                    });
                });
        }

        return this;
    }

    /**
     * use module, custom module.
     *
     * @param {...(LoadType | CustomRegister<T>)[]} modules
     * @returns {this}
     * @memberof PlatformServer
     */
    use(...modules: LoadType[]): this {
        this.usedModules = this.usedModules.concat(modules);
        return this;
    }

    /**
     * register modules via custom.
     *
     * @param {...CustomRegister<T>[]} moduleRegs
     * @returns {this}
     * @memberof ApplicationBuilder
     */
    registerModules(...moduleRegs: CustomRegister<T>[]): this {
        this.customRegs = this.customRegs.concat(moduleRegs);
        return this;
    }

    /**
     * use module, custom module.
     *
     * @param {...(LoadType | CustomRegister<T>)[]} modules
     * @returns {this}
     * @memberof PlatformServer
     */
    useModules(...modules: (LoadType | CustomRegister<T>)[]): this {
        modules.forEach(m => {
            if (isFunction(m) && !isClass(m)) {
                this.customRegs.push(m);
            } else {
                this.usedModules.push(m);
            }
        });
        return this;
    }

    /**
     * bootstrap application via main module
     *
     * @param {(Token<T> | Type<any> | AppConfiguration<T>)} bootModule
     * @returns {Promise<T>}
     * @memberof ApplicationBuilder
     */
    async bootstrap(bootModule: Token<T> | Type<any> | AppConfiguration<T>): Promise<any> {
        let container = this.getContainer();
        let builder = this.getModuleBuilder();
        let cfg: AppConfiguration<T> = await this.getConfiguration(this.getModuleConfigure(builder, bootModule));
        await this.initContainer(cfg, container);
        if (!cfg.bootstrap) {
            cfg.bootstrap = (isToken(bootModule) ? bootModule : null);
        }
        let app = await builder.build(cfg);
        return app;
    }

    protected createModuleBuilder() {
        return this.getContainer().get(ModuleBuilderToken);
    }

    protected createContainerBuilder() {
        return new DefaultContainerBuilder();
    }

    protected getModuleConfigure(builer: IModuleBuilder<T>, boot: Token<T> | Type<any> | AppConfiguration<T>): AppConfiguration<T> {
        return builer.getConfigure(boot);
    }


    protected setConfigRoot(config: AppConfiguration<T>) {
        if (this.baseURL) {
            config.baseURL = this.baseURL;
        }
    }

    protected async initContainer(config: AppConfiguration<T>, container: IContainer): Promise<IContainer> {
        this.setConfigRoot(config);
        if (this.usedModules.length) {
            let usedModules = this.usedModules;
            this.usedModules = [];
            await container.loadModule(container, ...usedModules);
        }
        container.bindProvider(AppConfigurationToken, config);

        if (this.customRegs.length) {
            let customs = this.customRegs;
            this.customRegs = [];
            await Promise.all(customs.map(cs => {
                return cs(container, config, this);
            }));
        }
        return container;
    }


    /**
     * get configuration.
     *
     * @returns {Promise<T>}
     * @memberof Bootstrap
     */
    protected async getConfiguration(cfg?: AppConfiguration<T>): Promise<AppConfiguration<T>> {
        if (!this.configuration) {
            this.useConfiguration(cfg);
        } else if (lang.hasField(cfg)) {
            this.useConfiguration(cfg);
        }
        return await this.configuration;
    }

    protected getDefaultConfig(): AppConfiguration<T> {
        return { debug: false } as AppConfiguration<T>;
    }


}
