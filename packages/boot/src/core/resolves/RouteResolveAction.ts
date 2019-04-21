import { IocCompositeAction, Singleton, Autorun, ResolveActionContext } from '@tsdi/ioc';
import { ContainerPoolToken } from '../ContainerPool';
import { ResolveModuleExportAction } from './ResolveModuleExportAction';
import { ResolveParentAction } from './ResolveParentAction';

@Singleton
@Autorun('setup')
export class RouteResolveAction extends IocCompositeAction<ResolveActionContext<any>> {

    execute(ctx: ResolveActionContext<any>, next?: () => void): void {
        if (this.container.has(ContainerPoolToken)) {
            super.execute(ctx, next);
        } else {
            next();
        }
    }

    setup() {
        this.use(ResolveModuleExportAction)
            .use(ResolveParentAction);
    }
}
