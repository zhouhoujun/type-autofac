
import { BuildContext } from './BuildContext';
import { ResolveHandle } from './ResolveHandle';
import { AfterInit } from '../../core';
import { isFunction } from '@tsdi/ioc';


export class ModuleAfterInitHandle extends ResolveHandle {
    async execute(ctx: BuildContext, next?: () => Promise<void>): Promise<void> {

        let target = ctx.target as AfterInit;
        if (target && isFunction(target.onAfterInit)) {
            await target.onAfterInit();
        }

        if (next) {
            await next();
        }
    }
}
