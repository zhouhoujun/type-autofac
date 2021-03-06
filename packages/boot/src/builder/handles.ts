import { ActionInjectorToken, AsyncHandler, IActionInjector, IActionSetup, Inject, INJECTOR, isClass, isNullOrUndefined } from '@tsdi/ioc';
import { IAnnoationContext, IBuildContext } from '../Context';
import { IAnnoationReflect } from '../annotations/reflect';
import { Handle, HandleType } from '../handles/Handle';
import { Handles } from '../handles/Handles';



/**
 * build handle.
 *
 * @export
 * @abstract
 * @class BuildHandle
 * @extends {Handle<T>}
 * @template T
 */
export abstract class BuildHandle<T extends IAnnoationContext = IBuildContext> extends Handle<T> {
    constructor(@Inject(ActionInjectorToken) protected actInjector: IActionInjector) {
        super();
    }
}

/**
 * composite build handles.
 *
 * @export
 * @class BuildHandles
 * @extends {Handles<T>}
 * @template T
 */
export class BuildHandles<T extends IAnnoationContext = IBuildContext> extends Handles<T> {
    constructor(@Inject(ActionInjectorToken) protected actInjector: IActionInjector) {
        super();
    }

    protected toHandle(handleType: HandleType<T>): AsyncHandler<T> {
        return this.actInjector.getAction<AsyncHandler<T>>(handleType);
    }

    protected registerHandle(handleType: HandleType<T>): this {
        if (isClass(handleType)) {
            this.actInjector.regAction(handleType);
        }
        return this;
    }
}



export abstract class ResolveHandle extends BuildHandle<IBuildContext> {

}

/**
 * resolve module scope.
 *
 * @export
 * @class ResolveMoudleScope
 * @extends {BuildHandles<BuildContext>}
 */
export class ResolveMoudleScope extends BuildHandles<IBuildContext> implements IActionSetup {

    async execute(ctx: IBuildContext, next?: () => Promise<void>): Promise<void> {
        if (ctx.value) {
            return;
        }

        let targetReflect: IAnnoationReflect;
        if (ctx.type && !ctx.reflects.hasRegister(ctx.type)) {
            ctx.injector.registerType(ctx.type);
            targetReflect = ctx.getTargetReflect();
            targetReflect && ctx.setValue(INJECTOR, targetReflect.getInjector())
        } else {
            targetReflect = ctx.getTargetReflect();
        }

        if (targetReflect || ctx.getTemplate()) {
            // has build module instance.
            await super.execute(ctx);
        }

        if (next) {
            await next();
        }

        // after all clean.
        if (isNullOrUndefined(ctx.value)) {
            setTimeout(() => ctx.destroy());
        }
    }

    setup() {
        this.use(ResolveModuleHandle);
    }
}

export const ResolveModuleHandle = async function (ctx: IBuildContext, next: () => Promise<void>): Promise<void> {
    if (!ctx.value && ctx.type) {
        ctx.value = ctx.injector.resolve(ctx.type, ctx.providers);
    }
    await next();
};
