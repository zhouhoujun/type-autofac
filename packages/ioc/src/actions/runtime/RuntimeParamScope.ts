import { RuntimeDecoratorScope } from './RuntimeDecoratorScope';
import { IocRegisterScope } from '../IocRegisterScope';
import { RuntimeActionContext } from './RuntimeActionContext';
import { RuntimeDecoratorRegisterer, DecoratorScopes } from '../../services';
import { Inject, AutoWired, Param } from '../../decorators';
import { BindParameterTypeAction } from './BindParameterTypeAction';
import { BindDeignParamTypeAction } from './BindDeignParamTypeAction';

export class RuntimeParamScope extends IocRegisterScope<RuntimeActionContext> {
    setup() {
        this.registerAction(BindParameterTypeAction);

        let decRgr = this.container.get(RuntimeDecoratorRegisterer);
        decRgr.register(Inject, DecoratorScopes.Parameter, BindParameterTypeAction);
        decRgr.register(AutoWired, DecoratorScopes.Parameter, BindParameterTypeAction);
        decRgr.register(Param, DecoratorScopes.Parameter, BindParameterTypeAction);

        this.use(RuntimeParamDecorScope, true)
            .use(BindDeignParamTypeAction);
    }
}


export class RuntimeParamDecorScope extends RuntimeDecoratorScope {
    protected getDecorScope(): DecoratorScopes {
        return DecoratorScopes.Parameter;
    }
}
