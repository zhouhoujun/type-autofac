import { LifeScope, Type, Modules, DesignRegisterer, IInjector, IocExt } from '@tsdi/ioc';
import { InjDecorRegisterer, InjIocExtScope, InjModuleToTypesAction, InjModuleScope} from './inj-actions';
import { InjContext } from './InjContext';

/**
 * module inject life scope.
 */
export class InjLifeScope extends LifeScope<InjContext> {
    execute(ctx: InjContext, next?: () => void): void {
        super.execute(ctx, next);
        // after all clean.
        ctx.destroy();
    }

    setup() {
        let ijdr = new InjDecorRegisterer();
        this.actInjector.regAction(InjIocExtScope);
        this.actInjector.getInstance(DesignRegisterer)
            .setRegisterer('Inj', ijdr);
        this.actInjector.setValue(InjDecorRegisterer, ijdr);

        ijdr.register(IocExt, InjIocExtScope);

        this.use(InjModuleToTypesAction)
            .use(InjModuleScope);
    }

    register(injector: IInjector, ...modules: Modules[]): Type[] {
        let types: Type[] = [];
        modules.forEach(md => {
            let ctx = InjContext.parse(injector, { module: md });
            this.execute(ctx);
            if (ctx.registered) {
                types.push(...ctx.registered);
            }
        });
        return types;
    }
}