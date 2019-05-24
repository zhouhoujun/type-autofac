import { BootContext } from '../BootContext';
import { BuildHandles } from '../core';
import { Runnable } from '../runnable';
import { RefRunnableHandle } from './RefRunnableHandle';
import { RefDecoratorRunnableHandle } from './RefDecoratorRunnableHandle';


export class ResolveRunnableScope extends BuildHandles<BootContext> {
    async execute(ctx: BootContext, next: () => Promise<void>): Promise<void> {
        ctx.runnable = ctx.getBootTarget();
        if (!(ctx.runnable instanceof Runnable)) {
            super.execute(ctx);
        }

        if (ctx.runnable) {
            await next();
        }
    }

    setup() {
        this.use(RefRunnableHandle)
            .use(RefDecoratorRunnableHandle);
    }
}
