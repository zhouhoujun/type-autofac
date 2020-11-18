// use core-js in browser.
import { TypeReflect } from '../decor/type';
import { ObjectMap, Type, AbstractType, Modules, ClassType, AnnotationType } from '../types';
import { clsUglifyExp } from './exps';

/**
 * lang utils
 */
export namespace lang {

    /**
     * create an new object from target object omit some field.
     *
     * @export
     * @param {ObjectMap} target
     * @param {...string[]} fields
     * @returns {*}
     */
    export function omit(target: ObjectMap, ...fields: string[]): any {
        if (isObject(target)) {
            let result: any = {};
            for (let key in target) {
                if (fields.indexOf(key) < 0) {
                    result[key] = target[key];
                }
            }
            return result;
        } else {
            return target;
        }
    }

    /**
     * for in opter for object or array.
     *
     * @export
     * @template T
     * @param {(ObjectMap<T> | T[])} target
     * @param {(item: T, idx?: number|string) => void|boolean} iterator
     */
    export function forIn<T = any>(target: ObjectMap<T>, iterator: (item: T, idx?: string) => void | boolean)
    export function forIn<T = any>(target: T[], iterator: (item: T, idx?: number) => void | boolean);
    export function forIn(target: any, iterator: (item: any, idx?: any) => void | boolean) {
        if (isArray(target)) {
            for (let i = 0, len = target.length; i < len; i++) {
                if (iterator(it, i) === false) {
                    break;
                }
            }
        } else if (target) {
            for (let key in target) {
                if (iterator(target[key], key) === false) {
                    break;
                }
            }
        }
    }

    /**
     * first.
     *
     * @export
     * @template T
     * @param {T[]} list
     * @returns {T}
     */
    export function first<T>(list: T[]): T {
        if (isArray(list) && list.length) {
            return list[0];
        }
        return null;
    }

    /**
     * remove element.
     * @param list list
     * @param el remove item.
     */
    export function remove<T>(list: T[], el: T | ((el: T) => boolean)) {
        if (!isArray(list) || !list.length) {
            return null;
        }
        let elm = isFunction(el) ? list.find(el) : el;
        return del(list, elm);
    }

    /**
     * delete item of list.
     * @param list list
     * @param el element
     */
    export function del<T>(list: T[], el: T) {
        const index = isArray(list) ? list.indexOf(el) : -1;
        if (index > -1) {
            return list.splice(index, 1);
        }
        return null;
    }

    /**
     * last.
     *
     * @export
     * @template T
     * @param {T[]} list
     * @returns {T}
     */
    export function last<T>(list: T[]): T {
        if (isArray(list) && list.length) {
            return list[list.length - 1];
        }
        return null;
    }

    /**
     * get class design annotation.
     *
     * @export
     * @param {ClassType} target
     * @returns
     */
    export function getDesignAnno(target: AnnotationType) {
        let annf: Function = target.ρAnn || target.d0Ann || target.getClassAnnations;
        return typeof annf === 'function' ? annf.call(target) : null;
    }

    /**
     * target has class design annotation or not.
     *
     * @export
     * @param {ClassType} target
     * @returns {boolean}
     */
    export function hasDesignAnno(target: AnnotationType): boolean {
        return typeof (target.ρAnn || target.d0Ann || target.getClassAnnations) === 'function';
    }


    /**
     * get class of object.
     *
     * @export
     * @param {*} target
     * @returns {Type}
     */
    export function getClass(target: any): Type {
        if (!target) {
            return null;
        }
        if (isClassType(target)) {
            return target as Type;
        }
        return target.constructor || target.prototype.constructor;
    }

    /**
     * get class name.
     *
     * @export
     * @param {AbstractType} target
     * @returns {string}
     */
    export function getClassName(target: any): string {
        let classType = typeof target === 'function' ? target : getClass(target);
        if (!classType) {
            return '';
        }
        if (clsUglifyExp.test(classType.name)) {
            let classAnnations = getDesignAnno(classType);
            return classAnnations ? classAnnations.name : classType.name;
        }
        return classType.name;
    }

    /**
     * get target type parent class.
     *
     * @export
     * @param {ClassType} target
     * @returns {ClassType}
     */
    export function getParentClass(target: ClassType): ClassType {
        let p = Reflect.getPrototypeOf(target.prototype);
        return isClassType(p) ? p : p.constructor as ClassType;
    }

    /**
     * get all parent class in chain.
     *
     * @export
     * @param {ClassType} target
     * @returns {ClassType[]}
     */
    export function getClassChain(target: ClassType): ClassType[] {
        let types: ClassType[] = [];
        forInClassChain(target, type => {
            types.push(type);
        });
        return types;
    }

    /**
     * iterate base classes of target in chain. return false will break iterate.
     *
     * @export
     * @param {Type} target
     * @param {(token: Type) => any} express
     */
    export function forInClassChain(target: ClassType, express: (token: ClassType) => any): void {
        while (isClassType(target)) {
            if (express(target) === false) {
                break;
            }
            target = getParentClass(target);
        }
    }

    /**
     * target is extends class of baseClass or not.
     *
     * @export
     * @param {Token} target
     * @param {(ClassType | ((type: ClassType) => boolean))} baseClass
     * @returns {boolean}
     */
    export function isExtendsClass<T extends ClassType>(target: ClassType, baseClass: T | ((type: T) => boolean)): target is T {
        let isExtnds = false;
        if (isClassType(target) && baseClass) {
            let isCls = isClassType(baseClass);
            forInClassChain(target, t => {
                if (isCls) {
                    isExtnds = t === baseClass;
                } else {
                    isExtnds = (<Function>baseClass)(t);
                }
                return !isExtnds;
            });
        }
        return isExtnds;
    }

    /**
     * get all class type in modules.
     *
     * @param {Modules[]} modules
     * @param {...Express<Type, boolean>[]} filters
     * @returns {Type[]}
     */
    export function getTypes(...modules: Modules[]): Type[] {
        if (!modules.length) {
            return [];
        } else if (modules.length === 1) {
            return getContentTypes(modules[0])
        }
        let types = [];
        modules.forEach(m => {
            types = types.concat(getContentTypes(m));
        })
        return types;
    }

    function getContentTypes(regModule: Modules): Type[] {
        let regModules: Type[] = [];
        if (isClass(regModule)) {
            regModules.push(regModule);
        } else if (regModule) {
            let rmodules = regModule['exports'] ? regModule['exports'] : regModule;
            for (let p in rmodules) {
                let type = rmodules[p];
                if (isClass(type)) {
                    regModules.push(type);
                }
            }
        }
        return regModules;
    }

    /**
     * async clean object.
     * @param obj.
     */
    export function cleanObj(obj: Object) {
        if (!obj) return;
        setTimeout(() => {
            for (let k in obj) {
                obj[k] = null;
            }
        });
    }
}

/**
*  action handle.
*/
export type Handler<T = any, TR = any> = (ctx: T, next?: () => TR) => TR;

/**
 * sync action.
 */
export type SyncHandler<T = any> = Handler<T, void>;

/**
 * async action.
 */
export type AsyncHandler<T = any> = Handler<T, Promise<void>>;

/**
 * execute action in chain.
 *
 * @export
 * @template T
 * @template TR
 * @param {ActionHandle<T>[]} handlers
 * @param {T} ctx
 * @param {() => TR} [next]
 */
export function chain<T, TR = void>(handlers: Handler<T, TR>[], ctx: T, next?: () => TR) {
    if (!handlers.length) return;
    let index = -1;
    function dispatch(idx: number): TR {
        if (idx <= index) {
            throw new Error('next called mutiple times.');
        }
        index = idx;
        let handle = idx < handlers.length ? handlers[idx] : null;
        if (idx === handlers.length) {
            handle = next;
        }
        if (!handle) {
            return;
        }
        try {
            return handle(ctx, dispatch.bind(null, idx + 1));
        } catch (err) {
            throw err;
        }
    }
    return dispatch(0);
}



declare let process: any;
const native = /native code/;
const toString = Object.prototype.toString;

/**
 * check target is function or not.
 *
 * @export
 * @param {*} target
 * @returns
 */
export function isFunction(target: any): target is Function {
    return typeof target === 'function';
}

/**
 * check Abstract class with @Abstract or not
 *
 * @export
 * @param {*} target
 * @returns {target is AbstractType}
 */
export function isAbstractClass(target: any): target is AbstractType {
    return classCheck(target, true)
}


/**
 * check target is class or not.
 *
 * @export
 * @param {*} target
 * @returns {target is Type}
 */
export function isClass(target: any): target is Type {
    return classCheck(target, false)
}

/**
 * is class or not.
 *
 * @export
 * @param {*} target
 * @returns {target is ClassType}
 */
export function isClassType(target: any): target is ClassType {
    return classCheck(target);
}

const refFiled = '_ρreflect_';
function classCheck(target: any, abstract?: boolean): boolean {
    if (!isFunction(target)) return false;

    if (!target.name || !target.prototype) return false;

    let rf: TypeReflect = target[refFiled]?.();

    if (rf) {
        if (isBoolean(abstract) && rf.type === target) {
            return abstract ? rf.abstract : !rf.abstract;
        }
        return true;
    }

    if (lang.hasDesignAnno(target)) return true;

    if (isBaseType(target)) return false;

    return Object.getOwnPropertyNames(target).indexOf('caller') < 0;
}

/**
 * is run in nodejs or not.
 *
 * @export
 * @returns {boolean}
 */
export function isNodejsEnv(): boolean {
    return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined')
}

const promiseTag = '[object Promise]';
/**
 * is target promise or not. now check is es6 Promise only.
 *
 * @export
 * @param {*} target
 * @returns {target is Promise<any>}
 */
export function isPromise(target: any): target is Promise<any> {
    return toString.call(target) === promiseTag
        || (target && typeof target.then === 'function');
}

const obserTag = '[object Observable]';
/**
 * is target rxjs observable or not.
 *
 * @export
 * @param {*} target
 * @returns {boolean}
 */
export function isObservable(target: any): boolean {
    return toString.call(target) === obserTag || (target && typeof target.subscribe === 'function');
}

const strTag = '[object String]';
/**
 * check target is string or not.
 *
 * @export
 * @param {*} target
 * @returns {target is string}
 */
export function isString(target: any): target is string {
    return typeof target === 'string' || toString.call(target) === strTag;
}

const boolTag = '[object Boolean]';
/**
 * check target is boolean or not.
 *
 * @export
 * @param {*} target
 * @returns {target is boolean}
 */
export function isBoolean(target: any): target is boolean {
    return typeof target === 'boolean' || toString.call(target) === boolTag;
}


const numbTag = '[object Number]';
/**
 * check target is number or not.
 *
 * @export
 * @param {*} target
 * @returns {target is number}
 */
export function isNumber(target: any): target is number {
    return typeof target === 'number' || toString.call(target) === numbTag;
}

/**
 * check target is undefined or not.
 *
 * @export
 * @param {*} target
 * @returns {target is undefined}
 */
export function isUndefined(target: any): target is undefined {
    return target === undefined;
}

/**
 * check target is unll or not.
 *
 * @export
 * @param {*} target
 * @returns {target is null}
 */
export function isNull(target: any): target is null {
    return target === null;
}

/**
 * is target null or undefined.
 *
 * @export
 * @param {*} target
 * @returns {boolean}
 */
export function isNullOrUndefined(target): boolean {
    return target === null || target === undefined;
}

/**
 * check taget is defined.
 *
 * @export
 * @param {*} target
 * @returns {boolean}
 */
export function isDefined(target: any): boolean {
    return !isNullOrUndefined(target);
}

/**
 * check target is array or not.
 *
 * @export
 * @param {*} target
 * @returns {target is Array<any>}
 */
export function isArray(target: any): target is Array<any> {
    return Array.isArray(target);
}

/**
 * check target is object or not.
 *
 * @export
 * @param {*} target
 * @returns {target is object}
 */
export function isObject(target: any): target is object {
    const type = typeof target;
    return target !== null && (type === 'object' || type === 'function');
}


const objectTag = '[object Object]';

/**
 * is custom class type instance or not.
 *
 * @export
 * @param {*} target
 * @returns {boolean}
 */
export function isTypeObject(target: any): boolean {
    return toString.call(target) === objectTag && target.constructor.name !== 'Object';
}


/**
 * is target base object or not.
 * eg. {}, have not self constructor;
 *
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 * @export
 * @param {*} target
 * @returns {target is Promise<any>}
 */
export function isPlainObject(target: any): target is ObjectMap {
    return toString.call(target) === objectTag && target.constructor.name === 'Object';
}

/**
 * is target base object or not.
 * eg. {}, have not self constructor;
 *
 * @deprecated use `isPlainObject` instead.
 */
export const isBaseObject = isPlainObject;

/**
 * is metadata object or not.
 *
 * @export
 * @param {*} target
 * @param {...(string|string[])[]} props
 * @returns {boolean}
 */
export function isMetadataObject(target: any, ...props: (string | string[])[]): boolean {
    if (!isPlainObject(target)) return false;
    if (props.length) {
        for (let n in target) {
            if (props.some(ps => isString(ps) ? ps === n : ps.indexOf(n) > 0)) {
                return true;
            }
        }
        return false;
    }

    return true;
}

const dateTag = '[object Date]';
/**
 * check target is date or not.
 *
 * @export
 * @param {*} target
 * @returns {target is Date}
 */
export function isDate(target: any): target is Date {
    return toString.call(target) === dateTag;
}

const symbolTag = '[object Symbol]';
/**
 * check target is symbol or not.
 *
 * @export
 * @param {*} target
 * @returns {target is Symbol}
 */
export function isSymbol(target: any): target is Symbol {
    return typeof target === 'symbol' || toString.call(target) === symbolTag;
}

const regTag = '[object RegExp]';
/**
 * check target is regexp or not.
 *
 * @export
 * @param {*} target
 * @returns {target is RegExp}
 */
export function isRegExp(target: any): target is RegExp {
    return toString.call(target) === regTag;
}

/**
 * is base type or not.
 *
 * @export
 * @param {*} target
 * @returns {boolean}
 */
export function isBaseType(target: any): boolean {
    return typeof target === 'function' && native.test(target.toString());
}

/**
 * check target is base value or not.
 *
 * @exportClassType
 */
export function isBaseValue(target: any): boolean {
    return isBaseType(lang.getClass(target));
}


/**
 * defer
 *
 * @export
 * @class Defer
 * @template T
 */
export class Defer<T> {
    /**
     * create defer.
     *
     * @static
     * @template T
     * @param {((val: T) => T | PromiseLike<T>)} [then]
     * @returns {Defer<T>}
     */
    static create<T>(then?: (val: T) => T | PromiseLike<T>): Defer<T> {
        let defer = new Defer<T>();
        if (then) {
            defer.promise = defer.promise.then(then);
            return defer;
        } else {
            return defer;
        }
    }
    /**
     * promise.
     *
     * @type {Promise<T>}
     */
    promise: Promise<T>;
    /**
     * resolve.
     */
    resolve: (value?: T | PromiseLike<T>) => void;
    /**
     * reject.
     */
    reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

/**
 * promise util.
 */
export namespace PromiseUtil {

    /**
     * create defer.
     *
     * @export
     * @template T
     * @param {((val: T) => T | PromiseLike<T>)} [then]
     * @returns {Defer<T>}
     */
    export function defer<T>(then?: (val: T) => T | PromiseLike<T>): Defer<T> {
        return Defer.create(then);
    }

    /**
     * run promise step by step.
     *
     * @export
     * @template T
     * @param {((T | PromiseLike<T> | ((value: T) => T | PromiseLike<T>))[])} promises
     * @returns
     */
    export function step<T>(promises: (T | PromiseLike<T> | ((value: T) => T | PromiseLike<T>))[]) {
        let result = Promise.resolve<T>(null);
        promises.forEach(p => {
            result = result.then(v => isFunction(p) ? p(v) : p);
        });
        return result;
    }
}
