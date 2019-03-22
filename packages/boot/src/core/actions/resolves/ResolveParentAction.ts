import { Singleton } from '@ts-ioc/ioc';
import { ParentContainerToken } from '../../ContainerPool';
import { IocResolveAction, ResovleActionContext, ResolveScopeAction } from '@ts-ioc/core'

/**
 * resolve parent action.
 *
 * @export
 * @class ResolveParentAction
 * @extends {IocResolveAction}
 */
@Singleton
export class ResolveParentAction extends IocResolveAction {

    execute(ctx: ResovleActionContext, next: () => void): void {
        let curr = ctx.getRaiseContainer();
        let parent = curr.get(ParentContainerToken);

        while (parent && !ctx.instance) {
            parent.bindActionContext(ctx);
            parent.get(ResolveScopeAction).execute(ctx);
            parent = parent.get(ParentContainerToken);
        }

        if (!ctx.instance) {
            curr.bindActionContext(ctx);
            next();
        }
    }
}
