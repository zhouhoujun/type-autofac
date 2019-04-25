import {  Src, ActivityContext } from '@tsdi/activities';
import { Injectable, ObjectMap, Express2, isArray, isString, lang } from '@tsdi/ioc';
import { toAbsolutePath } from '@tsdi/platform-server';
import { existsSync, readdirSync, lstatSync } from 'fs';
import { join, dirname, normalize, relative } from 'path';
import {
    mkdir, cp, rm
    /* ls, test, cd, ShellString, pwd, ShellArray, find, mv, TestOptions, cat, sed */
} from 'shelljs';
import * as globby from 'globby';
import { ProcessRunRootToken } from '@tsdi/boot';
const minimist = require('minimist');
const del = require('del');


/**
 * cmd options.
 *
 * @export
 * @interface CmdOptions
 */
export interface CmdOptions {
    /**
     * force execute command.
     *
     * @type {boolean}
     * @memberof CmdOptions
     */
    force?: boolean;
    /**
     * silent run command.
     *
     * @type {boolean}
     * @memberof CmdOptions
     */
    silent?: boolean;
}


/**
 * pipe activity context.
 *
 * @export
 * @class NodeActivityContext
 * @extends {ActivityContext}
 * @implements {IActivityContext<ITransform>}
 */
@Injectable
export class NodeActivityContext extends ActivityContext {

    packageFile = 'package.json';

    private envArgs: ObjectMap<any>;

    /**
     * get evn args.
     *
     * @returns {ObjectMap<any>}
     * @memberof NodeContext
     */
    getEnvArgs(): ObjectMap<any> {
        if (!this.envArgs) {
            this.envArgs = minimist(this.args || process.argv.slice(2));
        }
        return this.envArgs;
    }

    hasArg(arg): boolean {
        return process.argv.indexOf(arg) > -1 || process.argv.indexOf('--' + arg) > -1;
    }

    /**
     * get root folders.
     *
     * @param {Express2<string, string, boolean>} [express]
     * @returns {string[]}
     * @memberof NodeContext
     */
    getRootFolders(express?: Express2<string, string, boolean>): string[] {
        return this.getFolders(this.getRootPath(), express);
    }

    /**
     * get folders of path.
     *
     * @param {string} pathstr
     * @param {Express2<string, string, boolean>} [express]
     * @returns {string[]}
     * @memberof NodeContext
     */
    getFolders(pathstr: string, express?: Express2<string, string, boolean>): string[] {
        pathstr = normalize(pathstr);
        let dir = readdirSync(pathstr);
        let folders = [];
        dir.forEach(d => {
            let sf = join(pathstr, d);
            let f = lstatSync(sf);
            if (f.isDirectory()) {
                if (express) {
                    let fl = express(sf, d);
                    if (fl) {
                        folders.push(fl);
                    }
                } else {
                    folders.push(sf);
                }
            }
        });
        return folders;
    }

    /**
     * filter fileName in directory.
     *
     * @param {Src} express
     * @param {(fileName: string) => boolean} [filter]
     * @param {(filename: string) => string} [mapping]
     * @returns {Promise<string[]>}
     * @memberof NodeContext
     */
    async getFiles(express: Src, filter?: (fileName: string) => boolean, mapping?: (filename: string) => string): Promise<string[]> {
        lang.assertExp(isString(express) || isArray(express), 'input express param type error!');
        let filePaths: string[] = await globby(express);
        if (filter) {
            filePaths = filePaths.filter(filter);
        }

        if (mapping) {
            return filePaths.map(mapping);
        }

        return filePaths;
    }

    copyFile(src: Src, dist: string, options?: CmdOptions) {
        if (options && options.force) {
            rm('-f', dist);
            cp(src, dist);
        } else {
            cp(src, dist);
        }
    }

    copyDir(src: Src, dist: string, options?: CmdOptions) {
        if (!existsSync(dist)) {
            mkdir('-p', dist);
        }
        if (options && options.force) {
            rm('-rf', normalize(join(dist, '/')));
            mkdir('-p', normalize(join(dist, '/')));
            cp('-R', normalize(src + '/*'), normalize(join(dist, '/')));
        } else {
            cp('-R', normalize(src + '/*'), normalize(join(dist, '/')));
        }
    }

    async copyTo(filePath: string, dist: string): Promise<any> {
        const outFile = join(dist, filePath.replace(/(node_modules)[\\\/]/g, ''));
        return new Promise((res) => {
            if (!existsSync(outFile)) {
                if (!existsSync(dirname(outFile))) {
                    mkdir('-p', dirname(outFile));
                }
                cp('-R', join(filePath), outFile);
                res();
            }
        });
    }

    del(src: Src): Promise<any> {
        return del(src);
    }

    /**
     * to root path.
     *
     * @param {string} pathstr
     * @returns {string}
     * @memberof NodeContext
     */
    toRootPath(pathstr: string): string {
        let root = this.getRootPath();
        return root ? toAbsolutePath(root, pathstr) : pathstr;
    }

    /**
     * convert path to relative root path.
     *
     * @param {string} pathstr
     * @returns {string}
     * @memberof NodeActivityContext
     */
    relativeRoot(pathstr: string): string {
        if (/^(.{1,2}\/?\\?)?$/.test(pathstr)) {
            return pathstr;
        }
        let fullpath = this.toRootPath(pathstr);
        return relative(this.getRootPath(), fullpath) || '.';
    }

    getRootPath(): string {
        if (this.baseURL) {
            return this.baseURL;
        }
        return this.getRaiseContainer().get(ProcessRunRootToken) || process.cwd();
    }

    toRootSrc(src: Src): Src {
        let root = this.getRootPath();
        if (root) {
            if (isString(src)) {
                return this.prefixSrc(root, src);
            } else {
                return src.map(s => this.prefixSrc(root, s));
            }
        }
        return src;
    }

    private prefixSrc(root: string, strSrc: string): string {
        let prefix = '';
        if (/^!/.test(strSrc)) {
            prefix = '!';
            strSrc = strSrc.substring(1, strSrc.length);
        }
        return prefix + toAbsolutePath(root, strSrc);
    }

    private _package: any;
    /**
     * get package.
     *
     * @returns {*}
     * @memberof NodeContext
     */
    getPackage(): any {
        let filename = this.relativeRoot(this.packageFile);
        if (!this._package) {
            this._package = require(filename);
        }
        return this._package;
    }
    /**
     * get package version.
     *
     * @returns {string}
     * @memberof NodeContext
     */
    getPackageVersion(): string {
        let packageCfg = this.getPackage();
        if (!packageCfg) {
            return '';
        }
        return packageCfg.version || '';
    }
    /**
     * get module version.
     *
     * @param {string} name
     * @param {boolean} [dependencies=false]
     * @returns {string}
     * @memberof NodeContext
     */
    getModuleVersion(name: string, dependencies = false): string {
        let packageCfg = this.getPackage();
        if (!packageCfg) {
            return '';
        }
        let version = '';
        if (packageCfg.dependencies) {
            version = packageCfg.dependencies[name];
        }
        if (!dependencies && !version && packageCfg.devDependencies) {
            version = packageCfg.devDependencies[name];
        }

        return version || '';
    }
}