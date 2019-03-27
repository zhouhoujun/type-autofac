import { RegisterActionContext } from './RegisterActionContext';
import { DecoratorType } from '../factories';
import { ObjectMap } from '../types';
import { DecoratorRegisterer } from '../services';
import { IocRegisterScope } from './IocRegisterScope';


export abstract class IocDecoratorScope<T extends RegisterActionContext>  extends IocRegisterScope<T> {
    execute(ctx: T, next?: () => void): void {
        if (!this.isCompleted(ctx)) {
            this.getDecorators(ctx)
                .forEach(dec => {
                    ctx.currDecoractor = dec;
                    ctx.currDecorType = this.getDecorType();
                    super.execute(ctx);
                    this.done(ctx);
                });
        }
        next && next();
    }

    protected done(ctx: T): boolean {
        return this.getState(ctx, this.getDecorType())[ctx.currDecoractor] = true;
    }
    protected isCompleted(ctx: T): boolean {
        return Object.values(this.getState(ctx, this.getDecorType())).some(inj => inj);
    }
    protected getDecorators(ctx: T): string[] {
        let reg = this.getRegisterer();
        let states = this.getState(ctx, this.getDecorType());
        return Array.from(reg.getDecoratorMap(this.getDecorType()).keys())
            .filter(dec => states[dec] === false);
    }

    protected abstract getState(ctx: T, dtype: DecoratorType): ObjectMap<boolean>;
    protected abstract getRegisterer(): DecoratorRegisterer;
    protected abstract getDecorType(): DecoratorType;
}
