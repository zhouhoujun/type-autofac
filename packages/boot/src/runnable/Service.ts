import { IRunnable, Runnable } from './Runnable';
import { Abstract } from '@tsdi/ioc';

/**
 * IService interface
 *
 * @export
 * @interface IService
 */
export interface IService<T> extends IRunnable<T> {
    /**
     * start application service.
     *
     * @returns {Promise<any>}
     * @memberof IService
     */
    start(data?: any): Promise<any>;
    /**
     * stop server.
     *
     * @returns {Promise<any>}
     * @memberof IService
     */
    stop?(): Promise<any>;
}


/**
 * base service.
 *
 * @export
 * @abstract
 * @class Service
 * @implements {IService}
 */
@Abstract()
export abstract class Service<T> extends Runnable<T> implements IService<T> {

    /**
     * run service.
     * call start service.
     *
     * @param {*} [data]
     * @returns {Promise<any>}
     * @memberof Service
     */
    run(data?: any): Promise<any> {
        return this.start(data);
    }

    /**
     * start service.
     *
     * @abstract
     * @param {*} [data]
     * @returns {Promise<any>}
     * @memberof Service
     */
    abstract start(data?: any): Promise<any>;
    /**
     * stop service.
     *
     * @abstract
     * @returns {Promise<any>}
     * @memberof Service
     */
    abstract stop(): Promise<any>;
}
