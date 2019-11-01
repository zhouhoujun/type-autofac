import { isBaseValue, lang } from '@tsdi/ioc';
import { BaseTypeParser } from '@tsdi/boot';
import { observe } from './onChange';
import { ParseBinding } from './ParseBinding';
import { wTestExp } from './DataBinding';

/**
 * two way binding.
 *
 * @export
 * @class TwoWayBinding
 * @extends {ParseBinding<T>}
 * @template T
 */
export class TwoWayBinding<T> extends ParseBinding<T> {

    bind(target: any, obj?: any): T {
        if (!target) {
            return;
        }

        if (obj) {
            obj[this.binding.name] = target;
        }

        let scopeFiled = this.getScopeField();
        let scope = this.getValue(this.getScope(), wTestExp.test(this.prop) ? this.prop.substring(0, this.prop.lastIndexOf('.')) : '');

        observe.onPropertyChange(scope, scopeFiled, (value, oldVal) => {
            if (isBaseValue(value)) {
                let type = this.container.getTokenProvider(this.binding.provider) || this.binding.type;
                if (type !== lang.getClass(value)) {
                    value = this.container.getInstance(BaseTypeParser).parse(type, value);
                }
            }
            target[this.binding.name] = value;
        });

        observe.onPropertyChange(target, this.binding.name, (value, oldVal) => {
            scope[scopeFiled] = value;
        });

        let value = this.getSourceValue();
        target[this.binding.name] = value;

    }
}
