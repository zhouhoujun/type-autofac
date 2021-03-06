import { Inject, lang } from '@tsdi/ioc';
import { IContainer, ContainerToken } from '@tsdi/core';
import { Around, Aspect, Joinpoint, JoinpointState } from '@tsdi/aop';
import { LogProcess } from '@tsdi/logs';
import { WorkflowInstance } from '@tsdi/activities';
import * as chalk from 'chalk';
const timestamp = require('time-stamp');
const prettyTime = require('pretty-hrtime');
/**
 * Task Log
 *
 * @export
 * @class TaskLogAspect
 */
@Aspect({
    // annotation: Workflow,
    within: WorkflowInstance,
    singleton: true
})
export class RunnerLogAspect extends LogProcess {

    constructor(@Inject(ContainerToken) container: IContainer) {
        super(container);
    }

    @Around('execution(*.start)')
    processLog(joinPoint: Joinpoint) {
        let logger = this.logger;
        let runner = joinPoint.target as WorkflowInstance;
        let context = runner.getContext();
        let uuid = context.id;
        let name = runner.getBoot().name || lang.getClassName(context.type);
        let start, end;
        let taskname = '\'' + chalk.cyan(name || uuid) + '\'';
        if (joinPoint.state === JoinpointState.Before) {
            start = process.hrtime();
            runner['__startAt'] = start;
            logger.log('[' + chalk.grey(timestamp('HH:mm:ss', new Date())) + ']', 'Starting workflow', taskname, '...');
        }

        if (joinPoint.state === JoinpointState.AfterReturning) {
            start = runner['__startAt'];
            end = prettyTime(process.hrtime(start));
            delete runner['__startAt'];
            logger.log('[' + chalk.grey(timestamp('HH:mm:ss', new Date())) + ']', 'Finished workflow', taskname, ' after ', chalk.magenta(end));
        }

        if (joinPoint.state === JoinpointState.AfterThrowing) {
            start = runner['__startAt'];
            end = prettyTime(process.hrtime(start));
            delete runner['__startAt'];
            logger.log('[' + chalk.grey(timestamp('HH:mm:ss', new Date())) + ']', 'Finished workflow', taskname, chalk.red('errored after'), chalk.magenta(end));
            process.exit(1);
        }
    }

}
