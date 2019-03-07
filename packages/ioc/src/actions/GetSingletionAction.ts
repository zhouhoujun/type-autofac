import { IocRegisterAction, IocActionContext } from './Action';
import { IocSingletonManager } from '../services';

/**
 * singleton action, to set the factory of Token as singleton.
 *
 * @export
 * @class SingletionAction
 * @extends {IocRegisterAction}
 */
export class GetSingletionAction extends IocRegisterAction {

    execute(ctx: IocActionContext, next: () => void): void {
        if (ctx.targetType && (ctx.singleton || ctx.targetReflect.singleton)) {
            let mgr = this.container.resolve(IocSingletonManager);
            if (mgr.has(ctx.targetType)) {
                ctx.target = mgr.get(ctx.targetType);
                return;
            }
        }
        next();
    }
}

