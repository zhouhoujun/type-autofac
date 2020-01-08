import { createClassDecorator, isString, ITypeDecorator } from '@tsdi/ioc';
import { IComponentMetadata } from './IComponentMetadata';

/**
 * Component decorator
 *
 * @export
 * @interface IInjectableDecorator
 * @extends {IClassDecorator<IComponentMetadata>}
 */
export interface IComponentDecorator extends ITypeDecorator<IComponentMetadata> {
    /**
     * Component decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`ComponentLifecycle`]
     *
     * @Component
     *
     * @param {IComponentMetadata} [metadata] metadata map.
     */
    (metadata?: IComponentMetadata): ClassDecorator;

    /**
     * Component decorator, use to define class as Component element.
     *
     * @Task
     * @param {string} selector metadata selector.
     */
    (selector: string): ClassDecorator;
}

/**
 * Component decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`ComponentLifecycle`]
 *
 * @Component
 */
export const Component: IComponentDecorator = createClassDecorator<IComponentMetadata>('Component', [
    (ctx, next) => {
        if (isString(ctx.currArg)) {
            ctx.metadata.selector = ctx.currArg;
            ctx.next(next);
        }
    }
]);
