import { IContainer, IContainerBuilder, Injectable } from '@ts-ioc/core';
import { AppConfigure, DefaultApplicationBuilder, IApplicationBuilder, AnyApplicationBuilder, IAppConfigureLoader, AppConfigureLoaderToken } from '@ts-ioc/bootstrap';
import { existsSync } from 'fs';
import * as path from 'path';
import { ContainerBuilder } from '@ts-ioc/platform-server';

const processRoot = path.join(path.dirname(process.cwd()), path.basename(process.cwd()));

export interface ServerBuildExts {
    /**
     * root url
     *
     * @type {string}
     * @memberof IPlatformServer
     */
    baseURL: string;
    /**
     * load module from dir
     *
     * @param {...string[]} matchPaths
     * @memberof ServerBuildExts
     */
    loadDir(...matchPaths: string[]): this;
}

/**
 * server application builder.
 *
 * @export
 * @interface IServerApplicationBuilder
 * @extends {IApplicationBuilder<T>}
 * @template T
 */
export interface IApplicationBuilderServer<T> extends IApplicationBuilder<T>, ServerBuildExts {

}

export interface AnyApplicationBuilderServer extends AnyApplicationBuilder, ServerBuildExts {

}

@Injectable(AppConfigureLoaderToken)
export class ConfigureFileLoader implements IAppConfigureLoader {
    constructor(private baseURL: string, private container: IContainer) {

    }
    async load(uri?: string): Promise<AppConfigure> {
        if (uri) {
            if (existsSync(uri)) {
                return require(uri) as AppConfigure;
            } else if (existsSync(path.join(this.baseURL, uri))) {
                return require(path.join(this.baseURL, uri)) as AppConfigure;
            } else {
                console.log(`config file: ${uri} not exists.`)
                return null;
            }
        } else {
            let cfgmodeles: AppConfigure;
            let cfgpath = path.join(this.baseURL, './config');
            ['.js', '.ts', '.json'].forEach(ext => {
                if (cfgmodeles) {
                    return false;
                }
                if (existsSync(cfgpath + ext)) {
                    cfgmodeles = require(cfgpath + ext);
                    return false;
                }
                return true;
            });
            return cfgmodeles;
        }
    }

}


/**
 * server app.
 *
 * @export
 * @template T
 * @param {string} [baseURL]
 * @returns {IApplicationBuilderServer<T>}
 */
export function serverApp<T>(baseURL?: string): IApplicationBuilderServer<T> {
    return new ApplicationBuilder<T>(baseURL);
}

/**
 * application builder for server side.
 *
 * @export
 * @class Bootstrap
 */
export class ApplicationBuilder<T> extends DefaultApplicationBuilder<T> implements IApplicationBuilderServer<T> {


    private dirMatchs: string[][];
    constructor(public baseURL: string) {
        super(baseURL);
        this.dirMatchs = [];
    }

    /**
     * create instance.
     *
     * @static
     * @param {string} rootdir
     * @returns {ApplicationBuilder}
     * @memberof ApplicationBuilder
     */
    static create(rootdir: string): AnyApplicationBuilderServer {
        return new ApplicationBuilder<any>(rootdir || processRoot);
    }

    /**
     * load module from dirs.
     *
     * @param {...string[]} matchPaths
     * @returns {this}
     * @memberof PlatformServer
     */
    loadDir(...matchPaths: string[]): this {
        this.dirMatchs.push(matchPaths);
        return this;
    }

    protected async registerExts(container: IContainer, config: AppConfigure): Promise<IContainer> {
        await super.registerExts(container, config);
        await Promise.all(this.dirMatchs.map(dirs => {
            return container.loadModule(container, {
                basePath: config.baseURL,
                files: dirs
            });
        }));

        return container;
    }

    protected createContainerBuilder(): IContainerBuilder {
        return new ContainerBuilder();
    }

    protected createBuilder() {
        return this;
    }

}

