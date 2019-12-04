import { AdviceMetadata } from '../metadatas/AdviceMetadata';
import { IAdviceDecorator, createAdviceDecorator } from './Advice';

/**
 * aop after advice decorator.
 *
 * @After
 */
export const After: IAdviceDecorator<AdviceMetadata> = createAdviceDecorator<AdviceMetadata>('After') as IAdviceDecorator<AdviceMetadata>;
