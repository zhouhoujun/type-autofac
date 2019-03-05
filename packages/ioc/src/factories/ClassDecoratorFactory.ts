import 'reflect-metadata';
import { ClassMetadata } from '../metadatas';
import { Type, Token, ProvideToken, ClassType } from '../types';
import { createDecorator, MetadataAdapter, MetadataExtends } from './DecoratorFactory';
import { DecoratorType } from './DecoratorType';
import { Registration } from '../Registration';
import { isString, isSymbol, isObject, isNumber, isBoolean, isToken } from '../utils';
import { ArgsIterator } from './ArgsIterator';

/**
 * Type decorator.
 *
 * @export
 * @interface ITypeDecorator
 * @template T
 */
export interface ITypeDecorator<T extends ClassMetadata> {
    /**
     * define class decorator setting with metadata map.
     *
     * @param {T} [metadata] metadata map.
     */
    (metadata?: T): ClassDecorator;
    /**
     * not allow abstract to decorator with out metadata.
     */
    (target: Type<any>): void;
}

/**
 * class decorator.
 *
 * @export
 * @interface IClassDecorator
 */
export interface IClassDecorator<T extends ClassMetadata> extends ITypeDecorator<T> {

    /**
     * define class decorator setting with params.
     *
     * @param {ProvideToken<any>} provide define this class provider for provide.
     * @param {string} [alias] define this class provider with alias for provide.
     */
    (provide: ProvideToken<any>): ClassDecorator;

    /**
     * define class decorator setting with params.
     *
     * @param {Token<any>} provide define this class provider for provide.
     * @param {string} [alias] define this class provider with alias for provide.
     */
    (provide: Token<any>, alias: string): ClassDecorator;

    /**
     * define class decorator setting with params.
     *
     * @param {Token<any>} provide define this class provider for provide.
     * @param {string} [alias] define this class provider with alias for provide.
     * @param {Token<any>} [refTarget]  define the class as service of target.
     */
    (provide: Token<any>, alias: string, refTarget: Token<any>): ClassDecorator;

    /**
     * define class decorator setting with params.
     *
     * @param {Token<any>} provide define this class provider for provide.
     * @param {string} [alias] define this class provider with alias for provide.
     * @param {boolean} [singlton] define this class as singlton.
     * @param {Token<any>} [refTarget]  define the class as service of target.
     */
    (provide: Token<any>, alias: string, singlton: boolean, refTarget: Token<any>): ClassDecorator;

    /**
     * define class decorator setting with params.
     *
     * @param {Token<any>} provide define this class provider for provide.
     * @param {string} [alias] define this class provider with alias for provide.
     * @param {boolean} [singlton] define this class as singlton.
     * @param {number} [cache]  define class cahce expris when is not singlton.
     * @param {Token<any>} [refTarget]  define the class as service of target.
     */
    (provide: Token<any>, alias: string, cache: number, refTarget: Token<any>): ClassDecorator;

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
        if (adapter) {
            adapter(args);
        }
        args.next<T>({
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
            match: (arg) => isBoolean(arg) || isNumber(arg) || isToken(arg),
            setMetadata: (metadata, arg) => {
                if (isBoolean(arg)) {
                    metadata.singleton = arg;
                } else if (isNumber(arg)) {
                    metadata.expires = arg;
                } else if (isToken(arg)) {
                    metadata.refs = { target: arg, provide: metadata.provide || metadata.type, alias: metadata.alias  };
                }
            }
        });

        args.next<T>({
            match: (arg) => isToken(arg),
            setMetadata: (metadata, arg) => {
                metadata.expires = arg;
            }
        });
    });
    let decorator = createDecorator<T>(name, classAdapter, metadataExtends);
    decorator.decoratorType = DecoratorType.Class;
    return decorator;
}

