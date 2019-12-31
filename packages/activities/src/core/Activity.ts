import {
    isClass, Type, isNullOrUndefined, Abstract, PromiseUtil, Inject,
    ProviderTypes, lang, IInjector, InjectorFactoryToken, InjectorFactory
} from '@tsdi/ioc';
import { IContainer, ContainerToken } from '@tsdi/core';
import { Input } from '@tsdi/components';
import { Task } from '../decorators/Task';
import { ActivityContext } from './ActivityContext';
import { IActivity } from './IActivity';
import { ActivityResult } from './ActivityResult';
import { ActivityMetadata, ActivityType, Expression } from './ActivityMetadata';
import { IActivityExecutor, ActivityExecutorToken } from './IActivityExecutor';






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
export abstract class Activity<T = any, TCtx extends ActivityContext = ActivityContext> implements IActivity<TCtx> {

    /**
     * is scope or not.
     *
     * @type {boolean}
     * @memberof Activity
     */
    isScope?: boolean;

    protected _enableSetResult = true;


    /**
     * activity display name.
     *
     * @type {string}
     * @memberof Activity
     */
    @Input() name: string;

    private _result: ActivityResult<T>;
    /**
     * activity result.
     *
     * @type {ActivityResult<T>}
     * @memberof Activity
     */
    get result(): ActivityResult<T> {
        return this._result;
    }

    /**
     * conatiner.
     *
     * @type {IContainer}
     * @memberof Activity
     */
    @Inject(InjectorFactoryToken)
    private injFactory: InjectorFactory;

    constructor() {

    }

    getInjector(): IInjector {
        return this.injFactory();
    }

    getContainer(): IContainer {
        return this.getInjector().get(ContainerToken);
    }

    /**
     * run activity.
     *
     * @abstract
     * @param {TCtx} ctx
     * @param {() => Promise<void>} next
     * @returns {Promise<void>}
     * @memberof Activity
     */
    async run(ctx: TCtx, next?: () => Promise<void>): Promise<void> {
        ctx.status.current = this;
        this._result = await this.initResult(ctx);
        await this.refreshResult(ctx);
        await this.execute(ctx);
        await this.refreshContext(ctx);
        if (this.isScope) {
            ctx.status.scopeEnd();
        }
        if (next) {
            await next();
        }
    }

    protected abstract execute(ctx: TCtx): Promise<void>;

    protected async initResult(ctx: TCtx, ...providers: ProviderTypes[]): Promise<ActivityResult> {
        return this.getContainer().getService(this.getInjector(), { token: ActivityResult, target: lang.getClass(this) }, ...providers);
    }

    protected async refreshResult(ctx: TCtx): Promise<any> {
        let ret = isNullOrUndefined(ctx.result) ? ctx.getOptions().data : ctx.result;
        if (this._enableSetResult && !isNullOrUndefined(ret)) {
            this.setActivityResult(ctx, ret);
        }
    }

    protected setActivityResult(ctx: TCtx, value?: any) {
        this.result.value = value || ctx.result;
    }

    protected async refreshContext(ctx: TCtx) {
        if (this._enableSetResult && !isNullOrUndefined(this.result.value)) {
            this.setContextResult(ctx);
        }
    }

    protected setContextResult(ctx: TCtx) {
        ctx.result = this.result.value;
    }

    private _executor: IActivityExecutor;
    getExector(): IActivityExecutor {
        if (!this._executor) {
            this._executor = this.getContainer().resolve(ActivityExecutorToken);
        }
        return this._executor;
    }


    protected async runActivity(ctx: TCtx, activities: ActivityType | ActivityType[], next?: () => Promise<void>, refresh?: boolean): Promise<void> {
        await this.getExector().runActivity(ctx, activities, next);
        if (refresh !== false) {
            await this.refreshResult(ctx);
        }
    }

    protected runWorkflow(ctx: TCtx, activity: ActivityType, body?: any): Promise<TCtx> {
        return this.getExector().runWorkflow(ctx, activity, body);
    }

    private _actionFunc: PromiseUtil.ActionHandle;
    toAction(): PromiseUtil.ActionHandle<T> {
        if (!this._actionFunc) {
            this._actionFunc = (ctx: TCtx, next?: () => Promise<void>) => this.run(ctx, next);
        }
        return this._actionFunc;
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
    protected async resolveExpression<TVal>(express: Expression<TVal>, ctx: TCtx): Promise<TVal> {
        if (isNullOrUndefined(express)) {
            return null;
        }
        return await this.getExector().resolveExpression(ctx, express, this.getContainer());
    }

    protected promiseLikeToAction<T extends ActivityContext = ActivityContext>(action: (ctx?: T) => Promise<any>): PromiseUtil.ActionHandle<T> {
        return async (ctx: T, next?: () => Promise<void>) => {
            await action(ctx);
            if (next) {
                await next();
            }
        }
    }

}


/**
 * target is activity class.
 *
 * @export
 * @param {*} target
 * @returns {target is Type<IActivity>}
 */
export function isAcitvityClass(target: any, ext?: (meta: ActivityMetadata) => boolean): target is Type<IActivity> {
    if (!isClass(target)) {
        return false;
    }
    let key = Task.toString();
    if (Reflect.hasOwnMetadata(key, target)) {
        if (ext) {
            return Reflect.getOwnMetadata(key, target).some(meta => meta && ext(meta));
        }
        return true;
    }
    return false;
}
