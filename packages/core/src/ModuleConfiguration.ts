import { Token, Type, LoadType, Providers, ObjectMap } from './types';


/**
 * module configuration.
 *
 * @export
 * @interface ModuleConfiguration
 * @extends {ObjectMap<any>}
 */
export interface ModuleConfiguration<T> extends ObjectMap<any> {

    /**
     * providers
     *
     * @type {Providers[]}
     * @memberof ModuleConfiguration
     */
    providers?: Providers[];

    /**
     * imports dependens modules
     *
     * @type {LoadType[]}
     * @memberof ModuleConfiguration
     */
    imports?: LoadType[];

    /**
     * exports modules
     *
     * @type {Type<any>[]}
     * @memberof ModuleConfiguration
     */
    exports?: Type<any>[];
    /**
     * set this module bootstrap start with.
     *
     * @type {Token<T>}
     * @memberof ModuleConfiguration
     */
    bootstrap?: Token<T>;

}

