import { IocRuntimeAction } from './IocRuntimeAction';
import { RuntimeActionContext } from './RuntimeActionContext';
import { InjectReference } from '../../InjectReference';
import { ProviderMap } from '../../providers';
import { isToken, isNullOrUndefined } from '../../utils';


/**
 * inject property value action, to inject property value for resolve instance.
 *
 * @export
 * @class SetPropAction
 * @extends {ActionComposite}
 */
export class InjectPropertyAction extends IocRuntimeAction {

    execute(ctx: RuntimeActionContext, next: () => void) {
        let providerMap = ctx.providerMap;
        let container = this.container;

        let props = ctx.targetReflect.propProviders;

        props.forEach((token, propertyKey) => {
            let key = `${propertyKey}_INJECTED`
            if (isToken(token) && !ctx.hasContext(key)) {
                let pdrMap = container.get(new InjectReference(ProviderMap, ctx.targetType));
                if (pdrMap && pdrMap.has(token)) {
                    ctx.target[propertyKey] = pdrMap.resolve(token, providerMap);
                    ctx.setContext(key, true);
                } else if (providerMap && providerMap.has(token)) {
                    ctx.target[propertyKey] = providerMap.resolve(token, providerMap);
                    ctx.setContext(key, true);
                } else {
                    let val = container.resolve(token, providerMap);
                    if (!isNullOrUndefined(val)) {
                        ctx.target[propertyKey] = val;
                        ctx.setContext(key, true);
                    }
                }
            }
        });

        next();
    }
}
