import { InjectorAction } from './InjectorAction';
import { InjectorActionContext } from './InjectorActionContext';
import { ModuleLoader } from '../services/ModuleLoader';

export class ModuleToTypesAction extends InjectorAction {
    execute(ctx: InjectorActionContext, next: () => void): void {
        if (!ctx.types) {
            ctx.types = this.container.getInstance(ModuleLoader).getTypes(ctx.module);
        }
        ctx.registered = ctx.registered || [];
        next();
    }
}
