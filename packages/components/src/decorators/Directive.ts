import { createClassDecorator, isString, ITypeDecorator } from '@tsdi/ioc';
import { IDirectiveMetadata } from './IComponentMetadata';

/**
 * Directive decorator
 *
 * @export
 * @interface IDirectiveDecorator
 * @extends {IClassDecorator<IDirectiveMetadata>}
 */
export interface IDirectiveDecorator extends ITypeDecorator<IDirectiveMetadata> {
    /**
     * Component decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`ComponentLifecycle`]
     *
     * @Component
     *
     * @param {IDirectiveMetadata} [metadata] metadata map.
     */
    (metadata?: IDirectiveMetadata): ClassDecorator;

    /**
     * Component decorator, use to define class as Component element.
     *
     * @Task
     * @param {string} selector metadata selector.
     */
    (selector: string): ClassDecorator;
}

/**
 * Directive decorator, define for class. use to define the class as Directive.
 *
 * @Component
 */
export const Directive: IDirectiveDecorator = createClassDecorator<IDirectiveMetadata>('Directive', [
    (ctx, next) => {
        if (isString(ctx.currArg)) {
            ctx.metadata.selector = ctx.currArg;
            ctx.next(next);
        }
    }
]);
