import { IActionSetup, INJECTOR, isNullOrUndefined } from '@tsdi/ioc';
import { BuildHandles } from '../BuildHandles';
import { ResolveModuleHandle } from './ResolveModuleHandle';
import { IBuildContext } from '../IBuildContext';


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

        if (ctx.type && !ctx.reflects.hasRegister(ctx.type)) {
            ctx.injector.registerType(ctx.type);
            ctx.targetReflect && ctx.setValue(INJECTOR, ctx.targetReflect.getInjector())
        }

        if (ctx.targetReflect || ctx.getTemplate()) {
            // has build module instance.
            await super.execute(ctx);
        }

        if (next) {
            await next();
        }

        // after all clean.
        if (isNullOrUndefined(ctx.value)) {
            ctx.destroy();
        }
    }

    setup() {
        this.use(ResolveModuleHandle);
    }
}
