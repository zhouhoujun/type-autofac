import { ICoreInjector } from '@tsdi/core';
import { AnnoationOption } from '../AnnoationContext';


/**
 * module resolve option.
 *
 * @export
 * @interface IModuleResolveOption
 */
export interface IBuildOption<T = any> extends AnnoationOption<T> {
    /**
     * name of component.
     */
    name?: string;

    template?: any;

    /**
     * build as attr or not.
     */
    attr?: boolean;

    /**
     * sub build or not.
     */
    sub?: boolean;

    /**
     * module reslove in the injector.
     */
    injector?: ICoreInjector;
}
