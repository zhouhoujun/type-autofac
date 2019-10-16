import { BuildContext } from './BuildContext';
import { ResolveHandle } from './ResolveHandle';
import { StartupDecoratorRegisterer, StartupScopes } from '../../core';


export class DecoratorBuildHandle extends ResolveHandle {
    async execute(ctx: BuildContext, next?: () => Promise<void>): Promise<void> {
        let reg = this.container.getInstance(StartupDecoratorRegisterer).getRegisterer(StartupScopes.Build);
        await this.execFuncs(ctx, reg.getFuncs(this.container, ctx.targetReflect.decorator));

        if (next) {
            await next();
        }
    }
}

