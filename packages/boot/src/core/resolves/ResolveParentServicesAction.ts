import { IocResolveServicesAction, ResolveServicesContext } from '@tsdi/core';
import { ParentContainerToken } from '../ContainerPoolToken';
import { Type, IocCompositeAction, lang } from '@tsdi/ioc';


export class ResolveParentServicesAction extends IocResolveServicesAction {
    execute(ctx: ResolveServicesContext<any>, next: () => void): void {
        if (ctx.actionScope) {
            let scopeType: Type<IocCompositeAction<any>> = lang.getClass(ctx.actionScope);
            let parent = this.container.get(ParentContainerToken);
            if (parent && parent !== this.container) {
                parent.getActionRegisterer().get(scopeType).execute(ctx);
            }
        }
        if (!ctx.instance) {
            next();
        }
    }
}
