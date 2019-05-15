
import { BuildContext } from './BuildContext';
import { ResolveHandle } from './ResolveHandle';
import { BeforeInit, ComponentRegisterAction } from '../../core';
import { isFunction } from '@tsdi/ioc';
import { ModuleDecoratorRegisterer } from '@tsdi/core';


export class ModuleBeforeInitHandle extends ResolveHandle {
    async execute(ctx: BuildContext, next?: () => Promise<void>): Promise<void> {
        if (this.container.get(ModuleDecoratorRegisterer).has(ctx.decorator, ComponentRegisterAction)) {
            return;
        }
        if (ctx.decorator) {
            let target = ctx.target as BeforeInit;
            if (target && isFunction(target.onBeforeInit)) {
                await target.onBeforeInit();
            }
        }
        if (next) {
            await next();
        }
    }
}