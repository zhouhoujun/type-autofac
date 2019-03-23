import { IIocContainer } from '../../IIocContainer';
import { isUndefined, isFunction, lang } from '../../utils';
import { DecoratorRegisterer, OnInit } from '../../services';
import { IocRuntimeAction } from './IocRuntimeAction';
import { RuntimeActionContext } from './RuntimeActionContext';

/**
 * component before init action, to run @Component decorator class before init hooks.
 *
 * @export
 * @class ComponentInitAction
 * @extends {ActionComposite}
 */
export class ComponentInitAction extends IocRuntimeAction {

    constructor(container: IIocContainer) {
        super(container)
    }

    execute(ctx: RuntimeActionContext, next: () => void) {
        if (isUndefined(ctx.targetReflect.compInit)) {
            let decors = this.container.resolve(DecoratorRegisterer).getClassDecorators(ctx.targetType, lang.getClass(this));
            ctx.targetReflect.compInit = decors.length > 0
        }

        if (ctx.targetReflect.compInit) {
            let component = ctx.target as OnInit;
            if (isFunction(component.onInit)) {
                this.container.syncInvoke(ctx.target || ctx.targetType, 'onInit', ctx.target);
            }
        }
        next();
    }
}

