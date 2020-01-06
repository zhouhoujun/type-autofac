import { ObjectMap, IocDecoratorRegisterer, DecoratorScopes, DesignRegisterer, CTX_CURR_DECOR, IActionSetup } from '@tsdi/ioc';
import { InjectActionContext } from './InjectActionContext';
import { InjectScope } from './InjectAction';
import { DecoratorInjectAction } from './DecoratorInjectAction';

const DECOR_STATE = 'CTX_DECOR_STATE';

export class DecoratorInjectScope extends InjectScope implements IActionSetup {
    execute(ctx: InjectActionContext, next?: () => void): void {
        if (!this.isCompleted(ctx)) {
            this.getDecorators(ctx)
                .some(dec => {
                    ctx.set(CTX_CURR_DECOR, dec);
                    super.execute(ctx);
                    this.done(ctx);
                    return this.isCompleted(ctx);
                });
        }
        next && next();
    }

    getRegisterer(): IocDecoratorRegisterer {
        return this.actInjector.getInstance(DesignRegisterer).getRegisterer(DecoratorScopes.Inject);
    }

    protected getState(ctx: InjectActionContext): ObjectMap<boolean> {
        if (!ctx.has(DECOR_STATE)) {
            ctx.set(DECOR_STATE, this.getRegisterer()
                .getDecorators()
                .reduce((obj, dec) => {
                    obj[dec] = false;
                    return obj;
                }, {}));
        }
        return ctx.get(DECOR_STATE);
    }

    protected done(ctx: InjectActionContext): boolean {
        return this.getState(ctx)[ctx.get(CTX_CURR_DECOR)] = true;
    }
    protected isCompleted(ctx: InjectActionContext): boolean {
        return ctx.types.length === 0 || !Object.values(this.getState(ctx)).some(inj => !inj);
    }
    protected getDecorators(ctx: InjectActionContext): string[] {
        let states = this.getState(ctx);
        return Object.keys(states).reverse()
            .filter(dec => states[dec] === false);
    }

    setup() {
        this.use(DecoratorInjectAction);
    }
}