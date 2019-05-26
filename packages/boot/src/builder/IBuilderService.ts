import { IocCoreService, Type, ProviderTypes, InjectToken } from '@tsdi/ioc';
import { BootContext, BootOption } from '../BootContext';
import { IContainer } from '@tsdi/core';
import { IBootApplication } from '../IBootApplication';
import { IModuleResolveOption } from './resovers';
import { IRunnable } from '../runnable';
/**
 * service run runnable module.
 *
 * @export
 * @class BuilderService
 * @extends {IocCoreService}
 */
export interface IBuilderService extends IocCoreService {
    /**
     * resolve binding module.
     *
     * @template T
     * @param {Type<any>} target
     * @param {IModuleResolveOption} options
     * @param {(IContainer | ProviderTypes)} [container]
     * @param {...ProviderTypes[]} providers
     * @returns {Promise<T>}
     * @memberof BuilderService
     */
    resolve<T>(target: Type<any>, options: IModuleResolveOption, container?: IContainer | ProviderTypes, ...providers: ProviderTypes[]): Promise<T>;
    /**
     * create module.
     *
     * @template T
     * @param {(Type<any> | BootOption | T)} target
     * @param {...string[]} args
     * @returns {Promise<any>}
     * @memberof BuilderService
     */
    create<T extends BootContext>(target: Type<any> | BootOption | T, ...args: string[]): Promise<any>;
    createBoot<T>(target: Type<any> | BootOption | BootContext, ...args: string[]): Promise<T>;
    /**
     * build module.
     *
     * @template T
     * @param {(Type<any> | T)} target
     * @param {...string[]} args
     * @returns {Promise<T>}
     * @memberof BuilderService
     */
    build<T extends BootContext>(target: Type<any> | BootOption | T, ...args: string[]): Promise<T>;
    /**
     * create runnable.
     *
     * @template T
     * @param {(Type<any> | BootOption | BootContext)} target
     * @param {...string[]} args
     * @returns {Promise<IRunnable<T>>}
     * @memberof BuilderService
     */
    createRunnable<T>(target: Type<any> | BootOption | BootContext, ...args: string[]): Promise<IRunnable<T>>;
    /**
     * run module.
     *
     * @template T
     * @param {(Type<any> | T)} target
     * @param {...string[]} args
     * @returns {Promise<T>}
     * @memberof RunnerService
     */
    run<T extends BootContext>(target: Type<any> | BootOption | T, ...args: string[]): Promise<T>;
    /**
     * boot application.
     *
     * @template T
     * @param {(Type<any> | BootOption | T)} target
     * @param {...string[]} args
     * @returns {Promise<T>}
     * @memberof BuilderService
     */
    boot(application: IBootApplication, ...args: string[]): Promise<BootContext>;
}


export const BuilderServiceToken = new InjectToken<IBuilderService>('BOOT_BuilderService');
