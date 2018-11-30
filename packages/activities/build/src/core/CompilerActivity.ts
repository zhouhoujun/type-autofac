import { BuildHandleContext } from './BuildHandleActivity';
import { Task, ActivityConfigure } from '@taskfr/core';
import { CompilerToken } from './BuildHandle';
import { NodeActivity } from './NodeActivity';
import { BuidActivityContext } from './BuidActivityContext';


/**
 * compiler configure.
 *
 * @export
 * @interface CompilerConfigure
 * @extends {ActivityConfigure}
 */
export interface CompilerConfigure extends ActivityConfigure {

}

/**
 * compiler activity.
 *
 * @export
 * @abstract
 * @class CompilerActivity
 * @extends {NodeActivity}
 */
@Task(CompilerToken)
export abstract class CompilerActivity extends NodeActivity {

    /**
     * compile context.
     *
     * @type {BuildHandleContext<any>}
     * @memberof CompilerActivity
     */
    context: BuildHandleContext<any>;

    protected verifyCtx(ctx?: any) {
        if (ctx instanceof BuildHandleContext) {
            console.log('CompilerActivity BuildHandleContext:', ctx ? ctx.constructor.name : '');
            this.context = ctx;
        } else {
            console.log('CompilerActivity:', ctx ? ctx.constructor.name : '');
            this.setResult(ctx);
        }
    }
    /**
     * execute build activity.
     *
     * @protected
     * @abstract
     * @returns {Promise<void>}
     * @memberof NodeActivity
     */
    protected abstract async execute(): Promise<void>;
}
