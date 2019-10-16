import { DesignDecoratorScope } from './DesignDecoratorScope';
import { IocRegisterScope } from '../IocRegisterScope';
import { DesignActionContext } from './DesignActionContext';
import { BindMethodProviderAction } from './BindMethodProviderAction';
import { DecoratorScopes, DesignRegisterer } from '../DecoratorsRegisterer';
import { AutoWired, Providers } from '../../decorators';

export class DesignMethodScope extends IocRegisterScope<DesignActionContext> {
    setup() {
        this.registerAction(BindMethodProviderAction);

        this.container.getInstance(DesignRegisterer)
            .register(AutoWired, DecoratorScopes.Method, BindMethodProviderAction)
            .register(Providers, DecoratorScopes.Method, BindMethodProviderAction);

        this.use(DesignMethodDecoratorScope, true);
    }
}


export class DesignMethodDecoratorScope extends DesignDecoratorScope {
    protected getDecorScope(): DecoratorScopes {
        return DecoratorScopes.Method;
    }
}
