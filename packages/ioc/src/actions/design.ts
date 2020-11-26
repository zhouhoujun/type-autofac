import { isClass } from '../utils/chk';
import { DesignContext } from './ctx';
import { IActionSetup } from '../action';
import { InitReflectAction } from './reg';
import { RegisterLifeScope } from './lifescope';
import * as da from './des-act';


/**
 * life scope of design.
 *
 * @export
 * @class DesignLifeScope
 * @extends {LifeScope}
 */
export class DesignLifeScope extends RegisterLifeScope<DesignContext> implements IActionSetup {
    execute(ctx: DesignContext, next?: () => void): void {
        if (isClass(ctx.type)) {
            super.execute(ctx, next);
        }
    }
    setup() {
        this.use(
            InitReflectAction,
            da.DesignClassScope,
            da.DesignPropScope,
            da.DesignMthScope,
            da.AnnoScope
        );
    }
}


