import { Task } from '../decorators';
import { ActivityContext, Activity } from '../core';
import { ConditionActivity } from './ConditionActivity';
import { Input } from '@tsdi/boot';
import { BodyActivity } from './BodyActivity';

/**
 * if control activity.
 *
 * @export
 * @class IfActivity
 * @extends {ControlActivity}
 */
@Task('if')
export class IfActivity<T> extends Activity<T> {

    @Input()
    condition: ConditionActivity;

    @Input()
    body: BodyActivity<T>;

    protected async execute(ctx: ActivityContext): Promise<void> {
        await this.condition.run(ctx);
        if (this.condition.result.value) {
            await this.body.run(ctx);
        }
    }
}
