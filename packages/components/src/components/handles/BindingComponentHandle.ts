import { Element } from '../Element';
import { ComponentManager } from '../../ComponentManager';
import { BuildHandle, BuildContext } from '@tsdi/boot';


export class BindingComponentHandle extends BuildHandle<BuildContext> {
    async execute(ctx: BuildContext, next: () => Promise<void>): Promise<void> {

        if (ctx.component instanceof Element) {
            let target = ctx.target;
            ctx.component.scope = target;
            let scope = target;
            ctx.component.scopes = this.container.get(ComponentManager).getScopes(scope);
        }

        await next();
    }
}
