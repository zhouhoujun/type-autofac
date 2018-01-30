import 'reflect-metadata';
import { ClassMetadata } from '../metadatas/index';
import { Type } from '../../Type';
import { createDecorator, MetadataAdapter, MetadataExtends } from './DecoratorFactory';
import { DecoratorType } from './DecoratorType';
import { Registration } from '../../Registration';
import { isClass, isToken, isClassMetadata, isString, isSymbol, isObject, isNumber, isBoolean } from '../../utils/index';
import { ArgsIterator } from './ArgsIterator';


/**
 * class decorator.
 *
 * @export
 * @interface IClassDecorator
 */
export interface IClassDecorator<T extends ClassMetadata> {
    (provide: Registration<any> | symbol | string, alias?: string, singlton?: boolean, cache?: number): ClassDecorator;
    (metadata?: T): ClassDecorator;
    /**
     * not allow abstract to decorator with out metadata.
     */
    (target: Type<any>): void;
}




/**
 * create class decorator
 *
 * @export
 * @template T metadata type.
 * @param {string} name decorator name.
 * @param {MetadataAdapter} [adapter]  metadata adapter
 * @param {MetadataExtends<T>} [metadataExtends] add extents for metadata.
 * @returns {*}
 */
export function createClassDecorator<T extends ClassMetadata>(name: string, adapter?: MetadataAdapter, metadataExtends?: MetadataExtends<T>): IClassDecorator<T> {

    let classAdapter = ((args: ArgsIterator) => {
        let metadata;
        if (adapter) {
            adapter(args);
        }
        args.next<T>({
            isMetadata: (arg) => isClassMetadata(arg),
            match: (arg) => arg && (isSymbol(arg) || isString(arg) || (isObject(arg) && arg instanceof Registration)),
            setMetadata: (metadata, arg) => {
                metadata.provide = arg;
            }
        });

        args.next<T>({
            match: (arg) => isString(arg),
            setMetadata: (metadata, arg) => {
                metadata.alias = arg;
            }
        });

        args.next<T>({
            match: (arg) => isBoolean(arg),
            setMetadata: (metadata, arg) => {
                metadata.singleton = arg;
            }
        });

        args.next<T>({
            match: (arg) => isNumber(arg),
            setMetadata: (metadata, arg) => {
                metadata.expires = arg;
            }
        });
    });
    let decorator = createDecorator<T>(name, classAdapter, metadataExtends);
    decorator.decoratorType = DecoratorType.Class;
    return decorator;
}

