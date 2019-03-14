import { IocCompositeAction, lang, Singleton, isToken, isClass } from '@ts-ioc/ioc';
import { ResolveServiceContext } from './ResolveServiceContext';
import { TargetService } from '../TargetService';

@Singleton
export class ResolveServiceInClassChain extends IocCompositeAction<ResolveServiceContext> {
    execute(ctx: ResolveServiceContext, next: () => void): void {
        if (ctx.currTargetRef) {
            let currTgRef = ctx.currTargetRef;
            let targetType = isToken(currTgRef) ? currTgRef : currTgRef.getType();
            let classType = isClass(targetType) ? targetType : ctx.getTokenProvider(targetType);

            lang.forInClassChain(classType, ty => {
                if (ty === targetType) {
                    return true;
                }
                if (currTgRef instanceof TargetService) {
                    ctx.currTargetRef = currTgRef.clone(ty);
                } else {
                    ctx.currTargetRef = ty;
                }
                super.execute(ctx);
                if (ctx.instance) {
                    return false;
                }
                return true;
            });
            if (!ctx.instance) {
                ctx.currTargetRef = currTgRef;
                next();
            }
        } else {
            next();
        }
    }
}
