import { Task } from '../decorators';
import { ActivityContext, Expression, ConditionOption } from '../core';
import { BodyActivity } from './BodyActivity';


/**
 * condition activity.
 *
 * @export
 * @class ConditionActivity
 * @extends {ControlActivity<T>}
 * @template T
 */
@Task('condition')
export class ConditionActivity<T extends ActivityContext> extends BodyActivity<T> {

    condition: Expression<boolean>;

    async init(option: ConditionOption<T>) {
        if (option.condition) {
            this.condition = option.condition;
            await super.init(option);
        }
    }

    async execute(ctx: T, next?: () => Promise<void>): Promise<void> {
        if (this.vaildate(ctx)) {
            await this.whenTrue(ctx, next);
        } else {
            await this.whenFalse(ctx, next);
        }
    }

    protected async vaildate(ctx: T): Promise<boolean> {
        let condition = await this.resolveExpression(this.condition, ctx);
        return condition;
    }

    protected async whenTrue(ctx: T, next?: () => Promise<void>): Promise<void> {
        await this.execBody(ctx, next);
    }

    protected async whenFalse(ctx: T, next?: () => Promise<void>): Promise<void> {
        if (next) {
            await next();
        }
    }
}
