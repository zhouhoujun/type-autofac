import { Inject, lang } from '@tsdi/ioc';
import { IContainer, ContainerToken } from '@tsdi/core';
import { Around, Aspect, Joinpoint, JoinpointState } from '@tsdi/aop';
import { LoggerAspect } from '@tsdi/logs';
import { Task, Activity } from '@tsdi/activities';

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
        let start: Date, end: Date;
        let taskname = '\'' + name + '\'';
        if (joinPoint.state === JoinpointState.Before) {
            start = new Date();
            target['__startAt'] = start;
            logger.log('[' + start.toString() + ']', 'Starting', taskname, '...');
        }

        if (joinPoint.state === JoinpointState.AfterReturning) {
            start = target['__startAt'];
            end = new Date();
            delete target['__startAt'];
            logger.log('[' + end.toString() + ']', 'Finished', taskname, ' after ', end.getTime() - start.getTime());
        }

        if (joinPoint.state === JoinpointState.AfterThrowing) {
            start = target['__startAt'];
            end = new Date();
            delete target['__startAt'];
            logger.log('[' + end.toString() + ']', 'Finished', taskname, 'errored after', end.getTime() - start.getTime());
        }
    }
}
