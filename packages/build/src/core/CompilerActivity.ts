import { BuildHandleContext, HandleContextToken } from './BuildHandleActivity';
import { Task, ActivityContextToken, IActivityContext } from '@ts-ioc/activities';
import { NodeActivity } from './NodeActivity';
import { Providers, lang } from '@ts-ioc/core';


/**
 * compiler activity.
 *
 * @export
 * @abstract
 * @class CompilerActivity
 * @extends {NodeActivity}
 */
@Task
@Providers([
    { provide: ActivityContextToken, useExisting: HandleContextToken }
])
export abstract class CompilerActivity extends NodeActivity {

    /**
     * compile context.
     *
     * @type {BuildHandleContext<any>}
     * @memberof CompilerActivity
     */
    context: BuildHandleContext<any>;

    /**
     * execute build activity.
     *
     * @protected
     * @abstract
     * @returns {Promise<void>}
     * @memberof NodeActivity
     */
    protected abstract execute(): Promise<void>;
}

@Task
export class EmptyCompiler extends CompilerActivity {
    protected async execute(): Promise<void> {

    }
}