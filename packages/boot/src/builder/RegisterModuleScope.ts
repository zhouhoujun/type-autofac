import { isBaseType } from '@tsdi/ioc';
import { RegisterModuleRegisterHandle } from './RegisterModuleRegisterHandle';
import { AnnoationContext, BuildHandles } from '../core';
import { RegisterAnnoationHandle } from './RegisterAnnoationHandle';
import { BootContext } from '../BootContext';


export class RegisterModuleScope extends BuildHandles<AnnoationContext> {

    async execute(ctx: BootContext, next?: () => Promise<void>): Promise<void> {
        if (!(ctx instanceof BootContext)) {
            return;
        }
        if (!ctx.module) {
            if (ctx.getOptions().template && next) {
                return await next();
            }
            return;
        }
        if (isBaseType(ctx.module)) {
            return;
        }
        // has build module instance.
        if (!(this.container.has(ctx.module) && ctx.getRaiseContainer().has(ctx.module))) {
            await super.execute(ctx);
        }

        if (ctx.annoation && next) {
            await next();
        }
    }
    setup() {
        this.use(RegisterAnnoationHandle)
            .use(RegisterModuleRegisterHandle);
    }
}
