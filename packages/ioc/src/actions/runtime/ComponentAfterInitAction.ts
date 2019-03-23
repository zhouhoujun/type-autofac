import { DecoratorRegisterer, AfterInit } from '../../services';
import { isFunction, isUndefined, lang } from '../../utils';
import { IocRuntimeAction } from './IocRuntimeAction';
import { RuntimeActionContext } from './RuntimeActionContext';

/**
 * component after init action, to run @Component decorator class after init hooks.
 *
 * @export
 * @class ComponentAfterInitAction
 * @extends {ActionComposite}
 */
export class ComponentAfterInitAction extends IocRuntimeAction {

    execute(ctx: RuntimeActionContext, next: () => void) {
        if (isUndefined(ctx.targetReflect.compAfterInit)) {
            let decors = this.container.resolve(DecoratorRegisterer).getClassDecorators(ctx.targetType, lang.getClass(this));
            ctx.targetReflect.compAfterInit = decors.length > 0
        }

        if (ctx.targetReflect.compAfterInit) {
            let component = ctx.target as AfterInit;
            if (isFunction(component.afterInit)) {
                this.container.syncInvoke(ctx.target || ctx.targetType, 'afterInit', ctx.target);
            }
        }
        next();
    }
}

