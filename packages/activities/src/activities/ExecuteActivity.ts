import { Task } from '../decorators/Task';
import { ActivityContext, Activity, ActivityType } from '../core';


/**
 * execute activity.
 *
 * @export
 * @class Activity
 * @implements {GActivity<T>}
 * @template T
 */
@Task('execute')
export class ExecuteActivity<T extends ActivityContext> extends Activity<T>  {

    async execute(ctx: T, next: () => Promise<void>): Promise<void> {
        let exec = await this.resolveSelector<ActivityType<T>>(ctx);
        await this.execActivity(ctx, [exec], next);
    }
}
