import { IocCompositeAction, isToken, isClassType } from '@tsdi/ioc';
import { ResolveServiceContext } from './ResolveServiceContext';
import { ResolveServiceInClassChain } from './ResolveServiceInClassChain';
import { ResolveDecoratorServiceAction } from './ResolveDecoratorServiceAction';

export class ResolveTargetServiceAction extends IocCompositeAction<ResolveServiceContext<any>> {
    execute(ctx: ResolveServiceContext<any>, next?: () => void): void {
        if (!ctx.instance && ctx.targetRefs) {
            let has = ctx.targetRefs.some(t => {
                ctx.currTargetRef = t;
                ctx.currTargetToken = isToken(t) ? t : t.getToken();
                ctx.currTargetType = isClassType(ctx.currTargetToken) ? ctx.currTargetToken : this.container.getTokenProvider(ctx.currTargetToken);
                return ctx.tokens.some(tk => {
                    ctx.currToken = tk;
                    super.execute(ctx);
                    return !!ctx.instance;
                })
            });
            if (!has) {
                this.clear(ctx);
                next && next();
            }
        } else {
            next && next();
        }
    }

    protected clear(ctx: ResolveServiceContext<any>) {
        ctx.currToken = null;
        ctx.currTargetRef = null;
        ctx.currTargetType = null;
        ctx.currTargetToken = null;
    }

    setup() {
        this.use(ResolveServiceInClassChain, true)
            .use(ResolveDecoratorServiceAction);
    }
}