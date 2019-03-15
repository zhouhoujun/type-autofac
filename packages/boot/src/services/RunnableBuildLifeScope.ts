import { CompositeMiddleware } from '../middlewares';
import { AnnoationContext } from '../annotations/AnnoationMiddleware';
import { Singleton } from '@ts-ioc/ioc';

@Singleton
export class RunnableBuildLifeScope extends CompositeMiddleware<AnnoationContext> {

}
