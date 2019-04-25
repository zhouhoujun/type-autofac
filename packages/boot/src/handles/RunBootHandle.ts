import { BootHandle } from './BootHandle';
import { BootContext } from '../BootContext';

export class RunBootHandle extends BootHandle {
    async execute(ctx: BootContext, next: () => Promise<void>): Promise<void> {
        await ctx.runnable.onInit();
        if (ctx.autorun !== false) {
            await ctx.runnable.run(ctx.data);
        }

        await next();
    }
}