import { IModuleValidate, ModuelValidate } from '@ts-ioc/core';
import { IDIModuleInjector, DIModuleInjector } from '../modules';
import { Singleton, Inject } from '@ts-ioc/ioc';

/**
 * Bootstrap module Validate Token
 */
export const BootstrapValidateToken = new InjectModuleValidateToken<IModuleValidate>('@Bootstrap');


/**
 * Bootstrap module Validate
 *
 * @export
 * @class DIModuelValidate
 * @extends {ModuelValidate}
 */
@Singleton(BootstrapValidateToken)
export class BootstrapValidate extends ModuelValidate {
    getDecorator(): string {
        return '@Bootstrap';
    }
}

export const BootstrapInjectorToken = new InjectModuleInjectorToken<IDIModuleInjector>('@Bootstrap');


@Singleton(BootstrapInjectorToken)
export class BootstrapInjector extends DIModuleInjector {
    constructor(@Inject(BootstrapValidateToken) validate: IModuleValidate) {
        super(validate)
    }
}
