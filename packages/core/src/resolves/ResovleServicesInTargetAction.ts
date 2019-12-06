import { IocResolveServicesAction } from './IocResolveServicesAction';
import { isToken, InjectReference, Injector, isClassType, ProviderTypes } from '@tsdi/ioc';
import { ResolveServicesContext } from './ResolveServicesContext';
import { CTX_TARGET_REFS } from '../context-tokens';


export class ResovleServicesInTargetAction extends IocResolveServicesAction {
    execute(ctx: ResolveServicesContext, next: () => void): void {
        let targetRefs = ctx.get(CTX_TARGET_REFS);
        if (targetRefs && targetRefs.length) {
            targetRefs.forEach(t => {
                let tk = isToken(t) ? t : t.getToken();
                let maps = this.container.get(new InjectReference(Injector, tk));
                if (maps && maps.size) {
                    maps.iterator((fac, tk) => {
                        if (isClassType(tk) && ctx.types.some(ty => ctx.reflects.isExtends(tk, ty))) {
                            ctx.services.register(tk, (...providers: ProviderTypes[]) => fac(...providers));
                        }
                    })
                }
            });
            if (ctx.getOptions().both) {
                next();
            }
        } else {
            next();
        }
    }
}
