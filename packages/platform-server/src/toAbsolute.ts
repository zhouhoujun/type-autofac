import * as path from 'path';
import { existsSync } from 'fs';


/**
 * sync require.
 *
 * @export
 * @param {string} filename
 * @returns {*}
 */
export function syncRequire(filename: string): any {
    return require(filename);
}

/**
 * convert path to absolute path.
 *
 * @export
 * @param {string} root
 * @param {string} pathstr
 * @returns {string}
 */
export function toAbsolutePath(root: string, pathstr: string): string {
    if (!root || path.isAbsolute(pathstr)) {
        return pathstr;
    }
    return path.join(root, pathstr);
}

/**
 * get run main path.
 *
 * @export
 * @returns {string}
 */
export function runMainPath(): string {
    let cwd = process.cwd();
    if (process.mainModule && process.mainModule.filename && process.mainModule.filename.startsWith(cwd)) {
        return path.dirname(process.mainModule.filename);
    }
    if (process.argv.length > 2) {
        let mainfile = process.argv.slice(2).find(arg => /(\w+\.ts|\.js)$/.test(arg) && existsSync(path.join(cwd, arg)));
        if (mainfile) {
            return path.dirname(path.join(cwd, mainfile));
        }
    }
    return cwd;
}
