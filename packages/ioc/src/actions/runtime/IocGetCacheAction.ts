import { RuntimeActionContext } from './RuntimeActionContext';
import { IocRuntimeAction } from './IocRuntimeAction';
import { IocCacheManager } from '../IocCacheManager';

/**
 * get class cache action.
 *
 * @export
 * @class IocGetCacheAction
 * @extends {IocCacheAction}
 */
export class IocGetCacheAction extends IocRuntimeAction {
    execute(ctx: RuntimeActionContext, next: () => void): void {
        if (!ctx.target && !ctx.targetReflect.singleton && ctx.targetReflect.expires > 0) {
            let cache = this.container.getInstance(IocCacheManager).get(ctx.target, ctx.targetReflect.expires);
            if (cache) {
                ctx.target = cache;
                if (ctx.target) {
                    return;
                }
            }
        }
        next();
    }
}
