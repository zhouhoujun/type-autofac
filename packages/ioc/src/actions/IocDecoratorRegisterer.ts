import { isString, isClass, lang, isFunction } from '../utils';
import { IIocContainer } from '../IIocContainer';
import { IocAction, IocActionType } from './Action';
import { IocCoreService } from '../services';

/**
 * decorator action registerer.
 *
 * @export
 * @class IocDecoratorRegisterer
 * @extends {IocCoreService}
 */
export abstract class DecoratorRegisterer<T = IocActionType, TAction = lang.IAction> extends IocCoreService {
    protected actionMap: Map<string, T[]>;
    protected funcs: Map<string, TAction[]>;
    constructor() {
        super();
        this.actionMap = new Map();
        this.funcs = new Map();
    }

    get size(): number {
        return this.actionMap.size;
    }

    getActions(): Map<string, T[]> {
        return this.actionMap;
    }

    getDecorators(): string[] {
        return Array.from(this.actionMap.keys());
    }

    /**
     * register decorator actions.
     *
     * @param {(string | Function)} decorator
     * @param {...T[]} actions
     * @memberof DecoratorRegister
     */
    register(decorator: string | Function, ...actions: T[]): this {
        this.registing(decorator, actions, (regs, dec) => {
            regs.push(...actions);
            this.actionMap.set(dec, regs);
        });
        return this;
    }

    /**
     * register decorator actions before the action.
     *
     * @param {(string | Function)} decorator
     * @param {(T | boolean)} before
     * @param {...T[]} actions
     * @returns {this}
     * @memberof DecoratorRegisterer
     */
    registerBefore(decorator: string | Function, before: T, ...actions: T[]): this {
        this.registing(decorator, actions, (regs, dec) => {
            if (before && regs.indexOf(before) > 0) {
                regs.splice(regs.indexOf(before), 0, ...actions);
            } else {
                regs.unshift(...actions);
            }
            this.actionMap.set(dec, regs);
        });
        return this;
    }

    /**
     * register decorator actions after the action.
     *
     * @param {(string | Function)} decorator
     * @param {(T | boolean)} after
     * @param {...T[]} actions
     * @returns {this}
     * @memberof DecoratorRegisterer
     */
    registerAfter(decorator: string | Function, after: T, ...actions: T[]): this {
        this.registing(decorator, actions, (regs, dec) => {
            if (after && regs.indexOf(after) >= 0) {
                regs.splice(regs.indexOf(after) + 1, 0, ...actions);
            } else {
                regs.push(...actions);
            }
            this.actionMap.set(dec, regs);
        });
        return this;
    }

    protected registing(decorator: string | Function, actions: T[], reg: (regs: T[], dec: string) => void) {
        let dec = this.getKey(decorator);
        this.funcs.delete(dec);
        if (this.actionMap.has(dec)) {
            reg(this.actionMap.get(dec), dec);
        } else {
            this.actionMap.set(dec, actions);
        }
    }

    has(decorator: string | Function, action?: T): boolean {
        let dec = this.getKey(decorator);
        let has = this.actionMap.has(dec);
        if (has && action) {
            return this.actionMap.get(dec).indexOf(action) >= 0;
        }
        return has;
    }

    getKey(decorator: string | Function) {
        return isString(decorator) ? decorator : decorator.toString();
    }

    get(decorator: string | Function): T[] {
        let dec = this.getKey(decorator);
        if (this.actionMap.has(dec)) {
            return this.actionMap.get(dec);
        }
        return [];
    }


    getFuncs(container: IIocContainer, decorator: string | Function): TAction[] {
        let dec = this.getKey(decorator);
        if (!this.funcs.has(dec)) {
            this.funcs.set(dec, this.get(dec).map(a => a && this.toFunc(container, a)).filter(c => c));
        }
        return this.funcs.get(dec) || [];
    }

    abstract toFunc(container: IIocContainer, action: T): TAction;

}

/**
 * ioc decorator registerer.
 *
 * @export
 * @class IocDecoratorRegisterer
 * @extends {DecoratorRegisterer<T>}
 * @template T
 */
export class IocDecoratorRegisterer<T = IocActionType> extends DecoratorRegisterer<T> {

    toFunc(container: IIocContainer, ac: T): lang.IAction {
        if (isClass(ac)) {
            let action = container.getActionRegisterer().get(ac);
            return action instanceof IocAction ? action.toAction() : null;
        } if (ac instanceof IocAction) {
            return ac.toAction()
        }
        return isFunction(ac) ? <any>ac : null;
    }
}
