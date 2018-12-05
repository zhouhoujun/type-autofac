import { ModuelValidate, InjectModuleValidateToken, Injectable } from '@ts-ioc/core';
import { Task } from '../decorators';

/**
 * activity vaildate token
 */
export const ActivityValidateToken = new InjectModuleValidateToken(Task.toString());

@Injectable(ActivityValidateToken)
export class ActivityValidate extends ModuelValidate {
    getDecorator(): string {
        return Task.toString();
    }
}
