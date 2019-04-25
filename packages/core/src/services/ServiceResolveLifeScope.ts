import { Singleton, Autorun, LifeScope } from '@tsdi/ioc';
import {
    ResolveServiceContext, InitServiceResolveAction, ResolveServiceScope,
    ResolveDefaultServiceAction
} from '../resolves';


@Singleton
@Autorun('setup')
export class ServiceResolveLifeScope<T> extends LifeScope<ResolveServiceContext<T>> {

    execute(ctx: ResolveServiceContext<any>, next?: () => void): void {
        if (!ctx.instance) {
            super.execute(ctx, next);
        }
    }

    setup() {
        this.use(InitServiceResolveAction)
            .use(ResolveServiceScope, true)
            .use(ResolveDefaultServiceAction);
    }
}