import { IActionSetup } from '@tsdi/ioc';
import { BuildHandles } from '../builder/handles';
import { IAnnoationContext } from '../Context';
import {
    RegisterModuleScope, ModuleBuildScope, ResolveBootHandle, StartupBootstrap,
    RegBootEnvScope, BootConfigureRegisterHandle, StartupGlobalService
} from './handles';


export class RunnableBuildLifeScope extends BuildHandles<IAnnoationContext> implements IActionSetup {

    setup() {
        this.use(RegisterModuleScope)
            .use(ModuleBuildScope)
            .use(StartupBootstrap);
    }
}

export class StartupServiceScope extends BuildHandles<IAnnoationContext> implements IActionSetup {

    setup() {
        this.use(ResolveBootHandle)
            .use(StartupBootstrap);
    }
}

export class BootLifeScope extends BuildHandles<IAnnoationContext> implements IActionSetup {

    setup() {
        this.use(RegBootEnvScope)
            .use(RegisterModuleScope)
            .use(BootConfigureRegisterHandle)
            .use(ModuleBuildScope)
            .use(StartupGlobalService)
            .use(StartupBootstrap);
    }
}