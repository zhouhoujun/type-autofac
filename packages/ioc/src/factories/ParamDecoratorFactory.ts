import 'reflect-metadata';
import { ParameterMetadata } from '../metadatas';
import { createDecorator, MetadataExtends } from './DecoratorFactory';
import { DecoratorType } from './DecoratorType';
import { isToken } from '../utils';
import { ArgsIteratorAction } from './ArgsIterator';
import { Token } from '../types';


/**
 * Parameter decorator.
 *
 * @export
 * @interface IParameterDecorator
 */
export interface IParameterDecorator<T extends ParameterMetadata> {
    /**
     * define parameter decorator with param.
     *
     * @param {Token<T>} provider define provider to resolve value to the parameter.
     */
    (provider: Token<T>): ParameterDecorator;
    /**
     * define parameter decorator with metadata map.
     * @param {T} [metadata] define matadata map to resolve value to the parameter.
     */
    (metadata?: T): ParameterDecorator;
    /**
     * define paramete decorator.
     */
    (target: object, propertyKey: string | symbol, parameterIndex: number): void;
    decoratorType?: DecoratorType;
}



/**
 * create parameter decorator.
 *
 * @export
 * @template T metadata type.
 * @param {string} name decorator name.
 * @param {ArgsIteratorAction<T>[]} [actions]  metadata adapter
 * @param {MetadataExtends<T>} [metadataExtends] add extents for metadata.
 * @returns
 */
export function createParamDecorator<T extends ParameterMetadata>(
    name: string,
    actions?: ArgsIteratorAction<T>[],
    metadataExtends?: MetadataExtends<T>): IParameterDecorator<T> {
    actions = actions || [];
    actions.push((ctx, next) => {
        let arg = ctx.currArg;
        if (isToken(arg)) {
            ctx.metadata.provider = arg;
            ctx.next(next);
        }
    });
    let decorator = createDecorator<T>(name, actions, metadataExtends);
    decorator.decoratorType = DecoratorType.Parameter;
    return decorator;
}
