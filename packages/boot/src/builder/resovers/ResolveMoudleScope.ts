import { CompositeHandle } from '../../core';
import { DecoratorBuildHandle } from './DecoratorBuildHandle';
import { ResolveModuleHandle } from './ResolveModuleHandle';
import { BuildContext } from './BuildContext';
import { BuildDecoratorRegisterer } from './BuildDecoratorRegisterer';
import { InitResolveModuleHandle } from './InitResolveModuleHandle';
import { InitBindingParamHandle } from './InitBindingParamHandle';
import { ModuleBeforeInitHandle } from './ModuleBeforeInitHandle';
import { ModuleAfterInitHandle } from './ModuleAfterInitHandle';
import { ResolveTemplateScope } from './ResolveTemplateScope';
import { BindingComponentDecoratorRegisterer } from './BindingComponentDecoratorRegisterer';
import { BindingTemplateHandle } from './BindingTemplateHandle';
import { ModuleAfterContentInitHandle } from './ModuleAfterContentInitHandle';
import { BindingPropertyHandle } from './BindingPropertyHandle';
import { BindingScope, TemplateParseScope } from '../parses';


export class ResolveMoudleScope extends CompositeHandle<BuildContext> {

    async execute(ctx: BuildContext, next?: () => Promise<void>): Promise<void> {
        // has build module instance.
        if (!ctx.target) {
            await super.execute(ctx, next);
        }
        if (next) {
            await next();
        }
    }

    setup() {
        if (!this.container.has(BuildDecoratorRegisterer)) {
            this.container.register(BuildDecoratorRegisterer);
        }
        if (!this.container.has(BindingComponentDecoratorRegisterer)) {
            this.container.register(BindingComponentDecoratorRegisterer);
        }
        this.registerHandle(BindingScope, true)
            .registerHandle(TemplateParseScope, true);

        this.use(InitResolveModuleHandle)
            .use(InitBindingParamHandle)
            .use(ResolveModuleHandle)
            .use(DecoratorBuildHandle)
            .use(ModuleBeforeInitHandle)
            .use(BindingPropertyHandle)
            .use(ModuleAfterInitHandle)
            .use(ResolveTemplateScope)
            .use(BindingTemplateHandle)
            .use(ModuleAfterContentInitHandle);
    }
}
