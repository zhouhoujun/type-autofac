import { Task } from '../decorators/Task';
import { ActivityContext, Activity } from '../core';
import { ConditionActivity } from './ConditionActivity';
import { Input } from '../decorators';
import { BodyActivity } from './BodyActivity';


/**
 * while control activity.
 *
 * @export
 * @class WhileActivity
 * @extends {ControlActivity}
 */
@Task('while')
export class WhileActivity<T> extends Activity<T> {
    isScope = true;

    @Input()
    condition: ConditionActivity;

    @Input()
    body: BodyActivity<T>;

    protected async execute(ctx: ActivityContext): Promise<void> {
        await this.condition.run(ctx);
        if (this.condition.result.value) {
            await this.body.run(ctx, async () => {
                await this.condition.run(ctx);
                if (this.condition.result.value) {
                    await this.execute(ctx);
                }
            });
        }
    }
}
