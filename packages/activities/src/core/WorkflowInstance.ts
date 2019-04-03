import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Service } from '@tsdi/boot';
import { Joinpoint } from '@tsdi/aop';
import { Token, Injectable } from '@tsdi/ioc';
import { Activity } from './Activity';
import { ActivityContext } from './ActivityContext';

/**
 *run state.
 *
 * @export
 * @enum {number}
 */
export enum RunState {
    /**
     * activity init.
     */
    init,
    /**
     * runing.
     */
    running,
    /**
     * activity parused.
     */
    pause,
    /**
     * activity stopped.
     */
    stop,
    /**
     * activity complete.
     */
    complete
}

/**
 * task runner.
 *
 * @export
 * @class TaskRunner
 * @implements {ITaskRunner}
 */
@Injectable
export class WorkflowInstance<T extends Activity<any>> extends Service<T> {

    get activity(): Token<T> {
        return this.getTargetType();
    }

    private _ctx: ActivityContext;
    get context(): ActivityContext {
        return this._ctx;
    }

    private _result = new BehaviorSubject<any>(null);
    get result(): Observable<any> {
        return this._result.pipe(filter(a => !a));
    }

    private _resultValue: any;
    get resultValue(): any {
        return this._resultValue;
    }


    state: RunState;
    stateChanged: BehaviorSubject<RunState>;


    async onInit(): Promise<void> {
        let mgr = this.context.getConfigureManager();
        this.config = await mgr.getConfig();
    }

    run(data?: any): Promise<ActivityContext> {
        return this.start(data);
    }

    async start(data?: any): Promise<ActivityContext> {
        this.context.id && this.container.bindProvider(this.getTarget().id, this);
        this.state = RunState.complete;
        this.stateChanged.next(this.state);
        this._resultValue = ctx.result;
        this._result.next(ctx.result);
        return ctx;

    }

    _currState: Joinpoint;
    saveState(state: Joinpoint) {
        this._currState = state;
    }

    async stop(): Promise<any> {
        this.state = RunState.stop;
        this.stateChanged.next(this.state);
    }

    async pause(): Promise<any> {
        this.state = RunState.pause;
        this.stateChanged.next(this.state);
    }

}
