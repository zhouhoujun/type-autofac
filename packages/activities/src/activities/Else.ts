import { Input, BindingTypes } from '@tsdi/components';
import { Task } from '../decorators/Task';
import { ActivityContext } from '../core/ActivityContext';
import { ControlActivity } from '../core/ControlActivity';
import { IFStateKey } from './If';
import { ActivityType } from '../core/ActivityMetadata';

/**
 * else activity.
 *
 * @export
 * @class ElseActivity
 * @extends {ConditionActivity<T>}
 * @template T
 */
@Task('else')
export class ElseActivity extends ControlActivity {

    @Input({ bindingType: BindingTypes.dynamic }) body: ActivityType<any>;

    async execute(ctx: ActivityContext): Promise<void> {
        let currScope = ctx.workflow.status.currentScope;
        if (currScope.context.has(IFStateKey) && !currScope.context.get(IFStateKey)) {
            await ctx.getExector().runActivity(this.body);
        }
    }
}
