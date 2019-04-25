import { PromiseUtil, Injectable } from '@tsdi/ioc';
import { Activity } from './Activity';
import { ActivityContext } from './ActivityContext';
import { ActivityType } from './ActivityConfigure';

/**
 * chain activity.
 *
 * @export
 * @class ChainActivity
 * @extends {ControlActivity}
 */
@Injectable
export class CompoiseActivity<T extends ActivityContext> extends Activity<T> {

    isScope = true;
    protected activities: ActivityType[] = [];
    private actions: PromiseUtil.ActionHandle<T>[];

    add(...activities: ActivityType[]): this {
        this.activities.push(...activities);
        this.resetFuncs();
        return this;
    }

    /**
     * use activity.
     *
     * @param {ActivityType} activity
     * @param {boolean} [first]  use action at first or last.
     * @returns {this}
     * @memberof LifeScope
     */
    use(activity: ActivityType, first?: boolean): this {
        if (first) {
            this.activities.unshift(activity);
        } else {
            this.activities.push(activity);
        }
        this.resetFuncs();
        return this;
    }

    /**
     * use activity before
     *
     * @param {ActivityType} activity
     * @param {ActivityType} before
     * @returns {this}
     * @memberof LifeScope
     */
    useBefore(activity: ActivityType, before: ActivityType): this {
        this.activities.splice(this.activities.indexOf(before) - 1, 0, activity);
        this.resetFuncs();
        return this;
    }
    /**
     * use activity after.
     *
     * @param {ActivityType} activity
     * @param {ActivityType} after
     * @returns {this}
     * @memberof LifeScope
     */
    useAfter(activity: ActivityType, after: ActivityType): this {
        this.activities.splice(this.activities.indexOf(after) + 1, 0, activity);
        this.resetFuncs();
        return this;
    }

    protected async execute(ctx: T): Promise<void> {
        await this.execActions(ctx, this.getActions());
    }

    protected setScope(ctx: T, parentScope?: any) {
        ctx.currScope = parentScope || this;
    }


    protected getActions(): PromiseUtil.ActionHandle<T>[] {
        if (!this.actions) {
            this.actions = this.activities.map(ac => this.toAction(ac))
        }
        return this.actions;
    }

    protected resetFuncs() {
        this.actions = null;
    }
}