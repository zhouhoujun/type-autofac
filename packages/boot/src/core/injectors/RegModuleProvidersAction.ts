import { Type, ProviderTypes, isArray, ProviderParser } from '@tsdi/ioc';
import { AnnoationAction } from './AnnoationAction';
import { AnnoationContext } from '../AnnoationContext';
import { CTX_MODULE_EXPORTS } from '../../context-tokens';


export class RegModuleProvidersAction extends AnnoationAction {
    execute(ctx: AnnoationContext, next: () => void): void {
        let parser = this.container.getInstance(ProviderParser);
        let container = ctx.getContainer();
        let tRef = ctx.reflects;
        let config = ctx.annoation;
        let map = parser.parse(...config.providers || []);
        // bind module providers
        container.bindProviders(map);

        let exptypes: Type[] = [].concat(...container.getLoader().getTypes(config.exports || []));
        exptypes.forEach(ty => {
            let reflect = tRef.get(ty);
            map.register(ty, (...pds: ProviderTypes[]) => container.resolve(ty, ...pds));
            if (reflect && isArray(reflect.provides) && reflect.provides.length) {
                reflect.provides.forEach(p => {
                    if (!map.has(p)) {
                        map.register(p, (...pds: ProviderTypes[]) => container.resolve(p, ...pds));
                    }
                });
            }
        });
        ctx.set(CTX_MODULE_EXPORTS, map);
        next();
    }
}
