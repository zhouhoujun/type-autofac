import { Next } from './Handle';
import { AnnoationHandle, AnnoationContext } from './AnnoationHandle';
import { ContainerPoolToken } from '../ContainerPool';
import { DIModuleExports } from '../services';
import { Singleton } from '@ts-ioc/ioc';
import { RegScope } from '../modules';

@Singleton
export class RegisterExportsHandle extends AnnoationHandle {

    async execute(ctx: AnnoationContext, next: Next): Promise<void> {
        if (ctx.regScope === RegScope.child && ctx.moduleResolver) {
            let pool = ctx.resolve(ContainerPoolToken);
            let parent = pool.getParent(ctx.getModuleContainer());
            if (parent) {
                let diexports = parent.resolve(DIModuleExports);
                diexports.use(ctx.moduleResolver);
            }
        }
        await next();
    }
}
