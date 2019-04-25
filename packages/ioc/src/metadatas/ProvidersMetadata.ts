import { ProviderTypes } from '../providers';
import { TypeMetadata } from './TypeMetadata';

/**
 * add reference metadata. add ref service to the class.
 *
 * @export
 * @interface ProvidersMetadata
 * @extends {TypeMetadata}
 */
export interface ProvidersMetadata  extends TypeMetadata {
    /**
     * add ref service to the class.
     *
     * @type {KeyValue<Token<any>, Token<any>>}
     * @memberof ProvidersMetadata
     */
    providers?: ProviderTypes[];
}