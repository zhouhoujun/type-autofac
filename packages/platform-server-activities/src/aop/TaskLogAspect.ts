import { IContainer, ContainerToken } from '@tsdi/core';
import { Around, Aspect, Joinpoint, JoinpointState } from '@tsdi/aop';
import { LoggerAspect } from '@tsdi/logs';
import chalk from 'chalk';
import { Task, Activity } from '@tsdi/activities';
import { Inject, lang } from '@tsdi/ioc';
const timestamp = require('time-stamp');
const prettyTime = require('pretty-hrtime');

/**
 * Task Log
 *
 * @export
 * @class TaskLogAspect
 */
@Aspect({
    annotation: Task,
    within: Activity,
    singleton: true
})
export class TaskLogAspect extends LoggerAspect {

    constructor(@Inject(ContainerToken) container: IContainer) {
        super(container);
    }

    @Around('execution(*.execute)')
    logging(joinPoint: Joinpoint) {
        let logger = this.logger;
        let target = joinPoint.target as Activity<any>;
        let name = target.name;
        if (!name && target.scope) {
            name = lang.getClassName(target.scope);
        }
        if (!name) {
            name = lang.getClassName(joinPoint.targetType);
        }
        let start, end;
        let taskname = '\'' + chalk.cyan(name) + '\'';
        if (joinPoint.state === JoinpointState.Before) {
            start = process.hrtime();
            target['__startAt'] = start;
            logger.log('[' + chalk.grey(timestamp('HH:mm:ss', new Date())) + ']', 'Starting', taskname, '...');
        }

        if (joinPoint.state === JoinpointState.AfterReturning) {
            start = target['__startAt'];
            end = prettyTime(process.hrtime(start));
            delete target['__startAt'];
            logger.log('[' + chalk.grey(timestamp('HH:mm:ss', new Date())) + ']', 'Finished', taskname, ' after ', chalk.magenta(end));
        }

        if (joinPoint.state === JoinpointState.AfterThrowing) {
            start = target['__startAt'];
            end = prettyTime(process.hrtime(start));
            delete target['__startAt'];
            logger.log('[' + chalk.grey(timestamp('HH:mm:ss', new Date())) + ']', 'Finished', taskname, chalk.red('errored after'), chalk.magenta(end));
            process.exit(1);
        }
    }
}
