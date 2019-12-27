import { Type, TypeMetadata, createClassDecorator, isString, ITypeDecorator, isBoolean, SymbolType, ProviderMetadata } from '@tsdi/ioc';
import { IPipeTransform } from '../bindings/IPipeTransform';

/**
 * pipe decorator.
 */
export type PipeDecorator = <TFunction extends Type<IPipeTransform>>(target: TFunction) => TFunction | void;

/**
 * pipe metadata.
 *
 * @export
 * @interface IPipeMetadata
 * @extends {TypeMetadata}
 */
export interface IPipeMetadata extends TypeMetadata, ProviderMetadata {
    /**
     * name of pipe.
     */
    name: string;
    /**
     * If Pipe is pure (its output depends only on its input.)
     */
    prue?: boolean;
}


/**
 * Pipe decorator.
 *
 * @export
 * @interface IInjectableDecorator
 * @extends {ITypeDecorator<IPipeMetadata>}
 */
export interface IPipeDecorator extends ITypeDecorator<IPipeMetadata> {
    /**
     * Pipe decorator, define the class as pipe.
     *
     * @Pipe
     *
     * @param {IPipeMetadata} [metadata] metadata map.
     */
    (metadata?: IPipeMetadata): PipeDecorator;

    /**
     * Pipe decorator, define the class as pipe.
     *
     * @Pipe
     * @param {string} selector metadata selector.
     */
    (name: string, prue?: boolean): PipeDecorator;
}

/**
 * Pipe decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`PipeLifecycle`]
 *
 * @Pipe
 */
export const Pipe: IPipeDecorator = createClassDecorator<IPipeMetadata>('Pipe', [
    (ctx, next) => {
        if (isString(ctx.currArg)) {
            ctx.metadata.name = ctx.currArg;
            ctx.next(next);
        }
    },
    (ctx, next) => {
        if (isBoolean(ctx.currArg)) {
            ctx.metadata.prue = ctx.currArg;
        }
    },
], meta => {
    if (meta.name) {
        meta.provide = getPipeToken(meta.name);
    }
});

const pipePrefix = /^PIPE_/;
export function getPipeToken<T>(name: string): SymbolType<T> {
    return pipePrefix.test(name) ? name : `PIPE_${name}`;
}
