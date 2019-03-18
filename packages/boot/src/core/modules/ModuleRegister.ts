import { Inject, IocCoreService, Abstract } from '@ts-ioc/ioc';
import { ContainerToken, IContainer } from '@ts-ioc/core';
import { ModuleConfigure } from './ModuleConfigure';

/**
 * register module.
 *
 * @export
 * @abstract
 * @class ModuleRegister
 * @extends {IocCoreService}
 */
@Abstract()
export abstract class ModuleRegister extends IocCoreService {

    @Inject(ContainerToken)
    protected container: IContainer;

    /**
     * register config setting.
     *
     * @abstract
     * @param {T} config
     * @param {IRunnableBuilder<any>} [runBuilder]
     * @returns {Promise<void>}
     * @memberof ConfigureRegister
     */
    abstract register(config: ModuleConfigure): Promise<void>;

}
