import { AppConfigure } from './AppConfigure';
import {
    IContainer, LoadType, lang, isString, ContainerBuilderToken
} from '@ts-ioc/core';
import { IApplicationBuilder, CustomRegister } from './IApplicationBuilder';
import { ModuleBuilder } from './ModuleBuilder';
import { AnyModuleBuilder, ModuleBuilderToken } from './IModuleBuilder';
import { ContainerPool, ContainerPoolToken } from './ContainerPool';


/**
 * application builder.
 *
 * @export
 * @class Default ApplicationBuilder
 * @extends {ModuleBuilder}
 * @template T
 */
export class DefaultApplicationBuilder<T> extends ModuleBuilder<T> implements IApplicationBuilder<T> {
    protected globalConfig: Promise<AppConfigure>;
    protected globalModules: LoadType[];
    protected customRegs: CustomRegister<T>[];

    root: IContainer;

    constructor(public baseURL?: string) {
        super();
        this.globalModules = [];
        this.customRegs = [];
        this.pools = new ContainerPool();
    }

    static create(baseURL?: string): AnyModuleBuilder {
        return new DefaultApplicationBuilder<any>(baseURL);
    }

    /**
     * use configuration.
     *
     * @param {(string | AppConfigure)} [config]
     * @returns {this} global config for this application.
     * @memberof Bootstrap
     */
    useConfiguration(config?: string | AppConfigure, container?: IContainer): this {
        if (!this.globalConfig) {
            this.globalConfig = Promise.resolve(this.getDefaultConfig());
        }
        let pcfg: Promise<AppConfigure>;
        if (isString(config)) {
            if (container) {
                let builder = container.resolve(ContainerBuilderToken);
                pcfg = builder.loader.load([config])
                    .then(rs => {
                        return rs.length ? rs[0] as AppConfigure : null;
                    })
            }
        } else if (config) {
            pcfg = Promise.resolve(config);
        }

        if (pcfg) {
            this.globalConfig = this.globalConfig
                .then(cfg => {
                    return pcfg.then(rcfg => {
                        let excfg = (rcfg['default'] ? rcfg['default'] : rcfg) as AppConfigure;
                        cfg = lang.assign(cfg || {}, excfg || {}) as AppConfigure;
                        return cfg;
                    });
                });
        }

        return this;
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
        return this;
    }

    async registerConfgureDepds(container: IContainer, config: AppConfigure): Promise<AppConfigure> {
        if (!this.globalConfig) {
            this.useConfiguration();
        }
        let globalCfg = await this.globalConfig;
        config = this.mergeGlobalConfig(globalCfg, config);
        this.bindAppConfig(config);
        config = await super.registerConfgureDepds(container, config);
        return config;
    }

    protected mergeGlobalConfig(globalCfg: AppConfigure, moduleCfg: AppConfigure) {
        return lang.assign({}, globalCfg, moduleCfg);
    }

    protected regDefaultContainer() {
        let container = super.regDefaultContainer();
        container.bindProvider(ContainerPoolToken, () => this.getPools());
        container.resolve(ModuleBuilderToken).setPools(this.getPools());
        return container;
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
        await super.registerExts(container, config);

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

    protected getDefaultConfig(): AppConfigure {
        return { debug: false } as AppConfigure;
    }

}
