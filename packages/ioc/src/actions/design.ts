import { isClass } from '../utils/lang';
import { IActionSetup } from '../Action';
import { DesignContext, InitReflectAction } from './reg';
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
        this.actInjector.regAction(da.DesignDecorAction);

        this.use(InitReflectAction)
            .use(da.DesignClassScope)
            .use(da.DesignPropScope)
            .use(da.DesignMthScope)
            .use(da.AnnoScope);
    }
}


