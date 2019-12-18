import { Abstract } from '@tsdi/ioc';
import { RunnableConfigure } from './RunnableConfigure';
import { BootContext } from '../BootContext';

/**
 * configure register.
 *
 * @export
 * @interface IConfigureRegister
 * @template T
 */
export interface IConfigureRegister<T extends BootContext = BootContext> {
    /**
     * register config setting.
     *
     * @param {RunnableConfigure} config
     * @param {T} [ctx]
     * @returns {Promise<void>}
     * @memberof IConfigureRegister
     */
    register(config: RunnableConfigure, ctx?: T): Promise<void>;
}

/**
 * configure register.
 *
 * @export
 * @abstract
 * @class ConfigureRegister
 * @implements {IConfigureRegister<T>}
 * @template T
 */
@Abstract()
export abstract class ConfigureRegister<T extends BootContext = BootContext> implements IConfigureRegister<T> {

    constructor() {
    }

    /**
     * register config setting.
     *
     * @abstract
     * @param {RunnableConfigure} config
     * @param {T} [ctx]
     * @returns {Promise<void>}
     * @memberof ConfigureRegister
     */
    abstract register(config: RunnableConfigure, ctx?: T): Promise<void>;
}
