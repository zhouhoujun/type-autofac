import { createMethodDecorator, IMethodDecorator, MetadataExtends, isString, isRegExp, ArgsIteratorAction, isArray } from '@tsdi/ioc';
import { AdviceMetadata } from '../metadatas/AdviceMetadata';


/**
 * advice decorator for method.
 *
 * @export
 * @interface IAdviceDecorator
 * @extends {IMethodDecorator<T>}
 * @template T
 */
export interface IAdviceDecorator<T extends AdviceMetadata> extends IMethodDecorator<T> {
    /**
     * define advice with params.
     *
     * ### Usage
     * - path or module name, match express.
     *  - `execution(moduelName.*.*(..)) || @annotation(DecortorName) || @within(ClassName)`
     *  - `execution(moduelName.*.*(..)) && @annotation(DecortorName) && @within(ClassName)`
     *
     * ```
     * @Aspect()
     * class AspectClass {
     *   @Advice('"execution(moduelName.*.*(..)")')
     *   process(joinPoint: JointPoint){
     *   }
     * }
     * ```
     *
     * - match method with a decorator annotation.
     *
     * ```
     * @Aspect()
     * class AspectClass {
     *   @Advice('@annotation(DecoratorName)')
     *   process(joinPoint: JointPoint){
     *   }
     * }
     * ```
     *
     * @param {(string | RegExp)} [pointcut] define advice match express for pointcut.
     * @param { string } [annotation] annotation name, special annotation metadata for annotation advices.
     */
    (pointcut?: string | RegExp, annotation?: string): MethodDecorator;

    /**
     * define advice with metadata map.
     * @param {T} [metadata]
     */
    (metadata?: T): MethodDecorator;
}

export function createAdviceDecorator<T extends AdviceMetadata>(adviceName: string,
    actions?: ArgsIteratorAction<T>[],
    afterPointcutActions?: ArgsIteratorAction<T> | ArgsIteratorAction<T>[],
    metadataExtends?: MetadataExtends<T>): IAdviceDecorator<T> {
    actions = actions || [];

    actions.push((ctx, next) => {
        let arg = ctx.currArg;
        if (isString(arg) || isRegExp(arg)) {
            ctx.metadata.pointcut = arg;
            ctx.next(next);
        }
    });
    if (afterPointcutActions) {
        if (isArray(afterPointcutActions)) {
            actions.push(...afterPointcutActions);
        } else {
            actions.push(afterPointcutActions);
        }
    }

    actions.push(
        (ctx, next) => {
            let arg = ctx.currArg;
            if (isString(arg) && ctx.args.indexOf(arg) === 1) {
                ctx.metadata.annotationArgName = arg;
                ctx.next(next);
            }
        },
        (ctx, next) => {
            let arg = ctx.currArg;
            if (isString(arg)) {
                ctx.metadata.annotationName = arg;
                ctx.next(next);
            }
        }
    );

    return createMethodDecorator<AdviceMetadata>('Advice',
        actions,
        metadata => {
            if (metadataExtends) {
                metadataExtends(metadata as T);
            }
            metadata.adviceName = adviceName;
            return metadata;
        }) as IAdviceDecorator<T>;
}

/**
 * aop advice decorator.
 *
 * @Advice
 */
export const Advice: IAdviceDecorator<AdviceMetadata> = createAdviceDecorator('Advice');
