import {
    Inject, BeforeCtorScope, AfterCtorScope, IocContainerToken, IIocContainer,
    RuntimeMthScope, BindAnnoPdrAction, RegSingletionAction, RuntimeLifeScope,
    CtorArgsAction, ActionInjector, DesignRegisterer, RuntimeRegisterer, IocExt, TypeReflectsToken
} from '@tsdi/ioc';
import { Aspect } from './decorators/Aspect';
import { Advisor } from './Advisor';
import { AdviceMatcher } from './AdviceMatcher';
import { RegistAspectAction } from './actions/RegistAspectAction';
import { InvokeBeforeConstructorAction } from './actions/InvokeBeforeConstructorAction';
import { InvokeAfterConstructorAction } from './actions/InvokeAfterConstructorAction';
import { BindMethodPointcutAction } from './actions/BindMethodPointcutAction';
import { MatchPointcutAction } from './actions/MatchPointcutAction';
import { ProceedingScope } from './proceeding/ProceedingScope';
import { AdvisorToken } from './IAdvisor';
import { AdviceMatcherToken } from './IAdviceMatcher';



/**
 * aop ext for ioc. auto run setup after registered.
 * @export
 * @class AopModule
 */
@IocExt()
export class AopModule {

    constructor() {

    }

    /**
     * register aop for container.
     *
     * @memberof AopModule
     */
    setup(@Inject(IocContainerToken) container: IIocContainer) {

        const actInjector = container.getInstance(ActionInjector);
        const reflects = container.getInstance(TypeReflectsToken);

        actInjector
            .setValue(AdvisorToken, new Advisor(reflects), Advisor)
            .setValue(AdviceMatcherToken, new AdviceMatcher(reflects), AdviceMatcher);

        actInjector.regAction(ProceedingScope);

        actInjector.getInstance(BeforeCtorScope)
            .useBefore(InvokeBeforeConstructorAction);

        actInjector.getInstance(AfterCtorScope)
            // .use(ExetndsInstanceAction)
            .use(InvokeAfterConstructorAction);

        actInjector.getInstance(RuntimeMthScope)
            .useBefore(BindMethodPointcutAction);

        actInjector.getInstance(RuntimeLifeScope)
            .useBefore(MatchPointcutAction, CtorArgsAction);

        actInjector.getInstance(DesignRegisterer)
            .register(Aspect, 'Class', BindAnnoPdrAction, RegistAspectAction);

        actInjector.getInstance(RuntimeRegisterer)
            .register(Aspect, 'Class', RegSingletionAction);

    }
}
