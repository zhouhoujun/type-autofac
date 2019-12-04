import { BuildHandles } from '../../core';
import { DecoratorBuildHandle } from './DecoratorBuildHandle';
import { ResolveModuleHandle } from './ResolveModuleHandle';
import { BuildContext } from './BuildContext';

/**
 * resolve module scope.
 *
 * @export
 * @class ResolveMoudleScope
 * @extends {BuildHandles<BuildContext>}
 */
export class ResolveMoudleScope extends BuildHandles<BuildContext> {

    async execute(ctx: BuildContext, next?: () => Promise<void>): Promise<void> {
        if (ctx.target) {
            return;
        }

        if (ctx.targetReflect) {
            // has build module instance.
            await super.execute(ctx);
        }
        if (ctx.annoation && next) {
            await next();
        }

    }

    setup() {
        this.use(ResolveModuleHandle)
            .use(DecoratorBuildHandle);
    }
}