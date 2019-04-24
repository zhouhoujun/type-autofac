import { Task } from '../decorators/Task';
import { IContainer, ContainerToken } from '@tsdi/core';
import { RunnerService, BuilderService } from '@tsdi/boot';
import { ActivityContext } from './ActivityContext';
import { ActivityMetadata } from '../metadatas';
import {
    isClass, Type, hasClassMetadata, getOwnTypeMetadata, isFunction,
    isPromise, Abstract, PromiseUtil, Inject, isMetadataObject, isArray
} from '@tsdi/ioc';
import { ActivityType, Expression, ControlTemplate } from './ActivityConfigure';
import { SelectorManager } from './SelectorManager';


/**
 * activity base.
 *
 * @export
 * @abstract
 * @class ActivityBase
 * @implements {IActivity}
 * @implements {OnActivityInit}
 */
@Abstract()
export abstract class Activity<T extends ActivityContext> {

    /**
     * activity display name.
     *
     * @type {string}
     * @memberof Activity
     */
    name: string;

    /**
     * conatiner.
     *
     * @type {IContainer}
     * @memberof Activity
     */
    @Inject(ContainerToken)
    container: IContainer;


    constructor() {
    }

    /**
     * init activity.
     *
     * @param {ControlTemplate<T>} option
     * @memberof Activity
     */
    async init(option: ControlTemplate<T>) {
        if (option && option.name) {
            this.name = option.name;
        }
    }

    /**
     * run activity.
     *
     * @abstract
     * @param {T} ctx
     * @param {() => Promise<void>} next
     * @returns {Promise<void>}
     * @memberof Activity
     */
    abstract run(ctx: T, next?: () => Promise<void>): Promise<void>;
    // async run(ctx: T, next?: () => Promise<void>): Promise<void> {
    //     let vaildate = await this.vaildate(ctx);
    //     if (vaildate) {
    //         ctx.runnable.status.current = this;
    //         let state = await this.execute(ctx);
    //         ctx.runnable.status.setState(state);
    //         if (this.completed(ctx, state)) {
    //             await next && next();
    //         }
    //     } else {
    //         await next && next();
    //     }
    // }

    // protected abstract execute(ctx: T): Promise<ActivityResult>;

    // protected async vaildate(ctx: T): Promise<boolean> {
    //     return true;
    // }

    // protected completed(ctx: T, result: ActivityResult): boolean {
    //     return false;
    // }

    protected execActivity(ctx: T, activities: ActivityType<T> | ActivityType<T>[], next?: () => Promise<void>): Promise<void> {
        return PromiseUtil.runInChain((isArray(activities) ? activities : [activities]).map(ac => this.toAction(ac)), ctx, next);
    }

    protected execActions(ctx: T, actions: PromiseUtil.ActionHandle<T>[], next?: () => Promise<void>): Promise<void> {
        return PromiseUtil.runInChain(actions, ctx, next);
    }

    protected toAction(activity: ActivityType<T>): PromiseUtil.ActionHandle<T> {
        if (activity instanceof Activity) {
            return (ctx: T, next?: () => Promise<void>) => activity.run(ctx, next);
        } else if (isClass(activity) || isMetadataObject(activity)) {
            return async (ctx: T, next?: () => Promise<void>) => {
                let act = await this.buildActivity(activity as Type<any> | ControlTemplate<T>);
                if (act) {
                    await act.run(ctx, next);
                } else {
                    await next();
                }
            };

        } else if (isFunction(activity)) {
            return activity;
        } else {
            return (ctx: T, next?: () => Promise<void>) => next && next();
        }
    }

    protected async buildActivity(activity: Type<any> | ControlTemplate<T>): Promise<Activity<T>> {
        let ctx: ActivityContext;
        if (isClass(activity)) {
            ctx = await this.container.get(BuilderService).build(activity) as ActivityContext;
        } else {
            let md: Type<any>;
            let mgr = this.container.get(SelectorManager);
            if (isClass(activity.activity)) {
                md = activity.activity;
            } else {
                md = mgr.get(activity.activity)
            }

            let option = {
                module: md,
                template: activity
            };
            ctx = await this.container.get(BuilderService).build(option) as ActivityContext;
        }
        return ctx.getActivity();
    }


    /**
     * resolve expression.
     *
     * @protected
     * @template TVal
     * @param {ExpressionType<T>} express
     * @param {T} ctx
     * @returns {Promise<TVal>}
     * @memberof Activity
     */
    protected async resolveExpression<TVal>(express: Expression<TVal>, ctx: T): Promise<TVal> {
        if (isClass(express)) {
            let bctx = await this.container.get(RunnerService).run(express);
            return bctx.data;
        } else if (isFunction(express)) {
            return await express(ctx);
        } else if (isPromise(express)) {
            return await express;
        }
        return express;
    }

}

/**
 * is acitivty instance or not.
 *
 * @export
 * @param {*} target
 * @returns {target is Activity}
 */
export function isAcitvity(target: any): target is Activity<any> {
    return target instanceof Activity;
}

/**
 * target is activity class.
 *
 * @export
 * @param {*} target
 * @returns {target is Type<IActivity>}
 */
export function isAcitvityClass(target: any, ext?: (meta: ActivityMetadata) => boolean): target is Type<Activity<any>> {
    if (!isClass(target)) {
        return false;
    }
    if (hasClassMetadata(Task, target)) {
        if (ext) {
            return getOwnTypeMetadata<ActivityMetadata>(Task, target).some(meta => meta && ext(meta));
        }
        return true;
    }
    return false;
}
