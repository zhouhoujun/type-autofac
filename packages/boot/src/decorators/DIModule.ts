import { createClassDecorator, MetadataExtends, ITypeDecorator, isClass, lang, ArgsIteratorAction } from '@tsdi/ioc';
import { ModuleConfigure } from '../modules/ModuleConfigure';

/**
 * DI module metadata.
 *
 * @export
 * @interface DIModuleMetadata
 * @extends {ModuleConfigure}
 * @extends {ClassMetadata}
 */
export interface DIModuleMetadata extends ModuleConfigure {
    /**
     * custom decorator type.
     *
     * @type {string}
     * @memberof DIModuleMetadata
     */
    decorType?: string;
}


/**
 * DIModule decorator, use to define class as DI Module.
 *
 * @export
 * @interface IDIModuleDecorator
 * @extends {ITypeDecorator<T>}
 * @template T
 */
export interface IDIModuleDecorator<T extends DIModuleMetadata> extends ITypeDecorator<T> {
    /**
     * DIModule decorator, use to define class as DI Module.
     *
     * @DIModule
     *
     * @param {T} [metadata] bootstrap metadate config.
     */
    (metadata: T): ClassDecorator;
}

/**
 * create bootstrap decorator.
 *
 * @export
 * @template T
 * @param {string} name decorator name.
 * @param {MetadataAdapter} [actions]
 * @param {MetadataExtends<T>} [metadataExtends]
 * @returns {IDIModuleDecorator<T>}
 */
export function createDIModuleDecorator<T extends DIModuleMetadata>(
    name: string,
    actions?: ArgsIteratorAction<T>[],
    metadataExtends?: MetadataExtends<T>): IDIModuleDecorator<T> {

    return createClassDecorator<DIModuleMetadata>(name,
        actions,
        metadata => {
            if (metadataExtends) {
                metadataExtends(metadata as T);
            }

            if (!metadata.name && isClass(metadata.token)) {
                metadata.name = lang.getClassName(metadata.token);
            }
            metadata.decorType = name;
        }) as IDIModuleDecorator<T>;
}

/**
 * DIModule Decorator, definde class as DI module.
 *
 * @DIModule
 */
export const DIModule: IDIModuleDecorator<DIModuleMetadata> = createDIModuleDecorator<DIModuleMetadata>('DIModule');