import { IocResolveServiceAction, ResolveServiceContext } from '@tsdi/core';
import { ParentContainerToken } from '../ContainerPoolToken';
import { Type, IocCompositeAction, lang, ActionRegisterer } from '@tsdi/ioc';

export class ResolveParentServiceAction extends IocResolveServiceAction {
    execute(ctx: ResolveServiceContext, next: () => void): void {
        if (ctx.actionScope) {
            let scopeType: Type<IocCompositeAction> = lang.getClass(ctx.actionScope);
            let parent = this.container.get(ParentContainerToken);
            if (parent && parent !== this.container) {
                parent.getInstance(ActionRegisterer).get(scopeType).execute(ctx, next);
            }
        }
    }
}
