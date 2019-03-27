import { DesignDecoratorAction } from './DesignDecoratorAction';
import { IocDecoratorScope } from '../IocDecoratorScope';
import { DesignActionContext } from './DesignActionContext';
import { DesignDecoratorRegisterer } from '../../services';
import { DecoratorType } from '../../factories';

export class DesignPropertyScope extends IocDecoratorScope {

    protected filter(ctx: DesignActionContext, dec: string): boolean {
        return !ctx.targetReflect.propsDecors[dec];
    }
    protected done(ctx: DesignActionContext): boolean {
        return ctx.targetReflect.propsDecors[ctx.currDecoractor] = true;
    }
    protected isCompleted(ctx: DesignActionContext): boolean {
        return ctx.isPropertyCompleted();
    }
    protected getDecorators(ctx: DesignActionContext): string[] {
        let reg = this.container.get(DesignDecoratorRegisterer);
        let propDecors = Object.keys(ctx.targetReflect.propsDecors);
        return Array.from(reg.getDecoratorMap(this.getDecorType()).keys())
            .filter(dec => propDecors.indexOf(dec) >= 0);
    }
    protected getDecorType(): DecoratorType {
        return DecoratorType.Property;
    }

    setup() {
        this.use(DesignDecoratorAction);
    }
}
