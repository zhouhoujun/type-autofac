import {
    IocDesignAction, IocRuntimeAction, lang, Type, RuntimeActionContext,
    DesignActionContext, IocCompositeAction
} from '@tsdi/ioc';
import { ParentContainerToken } from '../ContainerPool';

export class RouteRuntimRegisterAction extends IocRuntimeAction {
    execute(ctx: RuntimeActionContext, next: () => void): void {
        if (ctx.currScope && this.container.has(ParentContainerToken)) {
            let scopeType: Type<IocCompositeAction<any>> = lang.getClass(ctx.currScope);
            let parent = this.container.get(ParentContainerToken);
            if (parent && parent !== this.container) {
                parent.get(scopeType).execute(ctx, next);
            }
        } else {
            next();
        }
    }
}

export class RouteDesignRegisterAction extends IocDesignAction {
    execute(ctx: DesignActionContext, next: () => void): void {
        if (ctx.currScope && this.container.has(ParentContainerToken)) {
            let scopeType: Type<IocCompositeAction<any>> = lang.getClass(ctx.currScope);
            let parent = this.container.get(ParentContainerToken);
            if (parent && parent !== this.container) {
                parent.get(scopeType).execute(ctx, next);
            }
        } else {
            next();
        }
    }
}
