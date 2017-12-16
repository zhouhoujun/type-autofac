import { ProviderMetadata } from './ProviderMetadata';
import { ObjectMap } from '../../index';


/**
 * class metadata.
 *
 * @export
 * @interface ClassMetadata
 */
export interface ClassMetadata extends ProviderMetadata {
    /**
     * is singleton or not.
     *
     * @type {boolean}
     * @memberof ClassMetadata
     */
    singleton?: boolean;
    /**
     * class package name.
     *
     * @type {string}
     * @memberof ClassMetadata
     */
    package?: string;

    // /**
    //  * constructor parameter names
    //  *
    //  * @type {string[]}
    //  * @memberof ClassMetadata
    //  */
    // parameterNames?: string[];
}

