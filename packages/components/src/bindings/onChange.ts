import { Events, BindEventType } from './Events';
import { lang } from '@tsdi/ioc';

export namespace observe {

    const events = new WeakMap<any, Events>();
    const defines = new WeakMap();


    export function onPropertyChange(target: any, property: string, onChange: (target: any, prop: string, vaule?: any, old?: any) => void) {
        let evt: Events;
        if (!events.has(target)) {
            evt = new Events();
            events.set(target, evt)
        } else {
            evt = events.get(target);
        }

        if (!defines.has(target) || !defines.get(target)[property]) {
            let descriptors = Object.getOwnPropertyDescriptors(lang.getClass(target).prototype);
            let descriptor = descriptors[property];
            let value = Reflect.get(target, property);
            Reflect.defineProperty(target, property, {
                get() {
                    if (descriptor && descriptor.get) {
                        return descriptor.get.call(target);
                    } else {
                        return value;
                    }
                },
                set(val: any) {
                    let isChanged = value !== val;
                    let old = value;
                    value = val;
                    if (descriptor && descriptor.set) {
                        descriptor.set.call(target, val);
                    }
                    if (isChanged) {
                        evt.emit(BindEventType.fieldChanged, target, property, val, old);
                    }
                }
            });

            let pps = defines.get(target) || {};
            pps[property] = true;
            defines.set(target, pps)
        }

        evt.on(BindEventType.fieldChanged, onChange);

    }
}
