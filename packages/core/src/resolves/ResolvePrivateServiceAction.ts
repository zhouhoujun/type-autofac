import { InjectReference, ProviderMap, Singleton, Token, isToken, isClassType } from '@tsdi/ioc';
import { ResolveServiceContext } from './ResolveServiceContext';
import { IocResolveServiceAction } from './IocResolveServiceAction';
import { TargetPrivateService } from '../TargetService';

@Singleton
export class ResolvePrivateServiceAction extends IocResolveServiceAction {
    execute(ctx: ResolveServiceContext<any>, next: () => void): void {
        // resolve private service.
        this.resolvePrivate(ctx, ctx.currToken || ctx.token);
        if (!ctx.instance) {
            next();
        }
    }

    protected resolvePrivate(ctx: ResolveServiceContext<any>, token: Token<any>) {
        if (ctx.currTargetRef && (isToken(ctx.currTargetRef) || ctx.currTargetRef instanceof TargetPrivateService)) {
            if (!isClassType(ctx.currTargetType)) {
                return;
            }
            let tk = new InjectReference(ProviderMap, ctx.currTargetType);
            if (tk !== token) {
                let map = this.container.has(tk) ? this.container.resolve(tk) : null;
                if (map && map.has(token)) {
                    ctx.instance = map.resolve(token, ...ctx.providers);
                }
            }
        }
    }
}
