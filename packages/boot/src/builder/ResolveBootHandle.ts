import { BootHandle } from './BootHandle';
import { BootContext } from '../BootContext';
import { isClass } from '@tsdi/ioc';
import { BuilderService } from '../services';


export class ResolveBootHandle extends BootHandle {
    async execute(ctx: BootContext, next: () => Promise<void>): Promise<void> {
        if (ctx.annoation.bootstrap && !ctx.bootstrap) {
            let bootModule = ctx.annoation.bootstrap;
            let container = ctx.getRaiseContainer();
            if (isClass(bootModule)) {
                ctx.bootstrap = await this.container.get(BuilderService).resolve(bootModule, {
                    template: ctx.template,
                    // annoation: ctx.annoation,
                    // decorator: ctx.decorator,
                    providers: ctx.providers
                }, ctx.getRaiseContainer());
            } else if (bootModule) {
                ctx.bootstrap = container.resolve(bootModule, ...ctx.providers);
            }
        }
        await next();
    }
}