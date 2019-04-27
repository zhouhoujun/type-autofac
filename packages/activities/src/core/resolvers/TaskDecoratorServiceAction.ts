import { IocResolveServiceAction, ResolveServiceContext } from '@tsdi/core';
import { getOwnTypeMetadata, isClassType, lang } from '@tsdi/ioc';
import { ActivityMetadata } from '../../metadatas';
import { BootContext } from '@tsdi/boot';
import { ActivityContext } from '../ActivityContext';

export class TaskDecoratorServiceAction extends IocResolveServiceAction {
    execute(ctx: ResolveServiceContext<any>, next: () => void): void {
        if (!isClassType(ctx.currTargetType)) {
            return next();
        }
        let metas = getOwnTypeMetadata<ActivityMetadata>(ctx.currDecorator, ctx.currTargetType);
        let stype = this.container.getTokenProvider(ctx.currToken || ctx.token);
        metas.some(m => {
            if (m && lang.isExtendsClass(m.contextType, stype)) {
                ctx.instance = this.container.get(m.contextType, ...ctx.providers);
            }
            return !!ctx.instance;
        });


        if (!ctx.instance && lang.isExtendsClass(stype, BootContext)) {
            this.resolve(ctx, ActivityContext);
        }
        if (!ctx.instance) {
            next();
        }
    }
}
