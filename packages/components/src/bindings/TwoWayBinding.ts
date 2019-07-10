import { DataBinding } from './DataBinding';
import { isFunction } from '@tsdi/ioc';
import { BindEventType } from './EventManager';

export class TwoWayBinding<T> extends DataBinding<T> {

    bind(target: any, prop: string): T {
        let value = this.getSourceValue();
        if (!target) {
            return value;
        }
        let scope = this.getScope();
        let scopeFiled = this.propName;
        let eventMgr = this.eventMgr;
        Object.defineProperty(scope, scopeFiled, {
            get() {
                return value
            },
            set(val: any) {
                let isChanged = value !== val;
                let old = value;
                value = val;
                if (isChanged) {
                    eventMgr.get(scope).emit(BindEventType.fieldChanged, prop, val, old);
                }
            }
        });

        let targetValue = value;
        Object.defineProperty(target, prop, {
            get() {
                return targetValue;
            },
            set(val: any) {
                let isChanged = targetValue !== val;
                let old = targetValue;
                targetValue = val;
                if (isChanged) {
                    eventMgr.get(target).emit(BindEventType.fieldChanged, prop, val, old);
                }
            }
        });

        eventMgr.get(target).on(BindEventType.fieldChanged, (field, val) => {
            scope[scopeFiled] = val;
        });

        eventMgr.get(scope).on(BindEventType.fieldChanged, (field, val) => {
            target[prop] = val;
        });


        return value;
    }
}
