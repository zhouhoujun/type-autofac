import { DIModule, BootApplication, BootContext, BuilderService, BuildHandleRegisterer, ParentContainerToken, ContainerPoolToken } from '@tsdi/boot';
import { Suite, Test, Before } from '@tsdi/unit';
import { Component, Input, ComponentsModule, ElementModule, ComponentBuilder, ElementDecoratorRegisterer, ComponentSelectorHandle } from '../src';
import expect = require('expect');
import { Inject, Injectable, Autorun } from '@tsdi/ioc';
import { IContainer, ContainerToken } from '@tsdi/core';


@Component('selector1')
class Component1 {
    @Input() name: string;

    constructor() {

    }
}


@Component('selector2')
class Component2 extends Component1 {
    @Input() address: string;
}


@Component('comp')
class Components {

    @Input() cmp1: Component1;

    @Input() cmp2: Component2;

}

@Component('selector3')
class Component3 extends Component1 {
    @Input() address: string;
    @Input() phone: string;
}

@Injectable()
class CustomeService {
    @Inject()
    builder: ComponentBuilder;

    @Inject(ContainerToken)
    container: IContainer;

    createComponent3() {
        // console.log(this.container.resolve(BuildHandleRegisterer));
        return this.builder.resolveTemplate({ template: { element: 'selector3', name: 'test3', address: 'address3', phone: '+86177000000010' } })
    }
}

@DIModule({
    imports: [
        Components,
        Component3,
        CustomeService
    ],
    exports: [
        Component3,
        CustomeService
    ]
})
class SubModule {

}


@DIModule({
    imports: [
        Component1,
        Component2,
        SubModule
    ],
    bootstrap: Component2
})
class ComponentTestMd {

}


@DIModule({
    imports: [
        ComponentsModule,
        ElementModule,
        Component1,
        Component2,
        // Component3,
        SubModule
    ],
    exports: [
        SubModule
    ],
    bootstrap: Component3
})
class ComponentTestMd2 {

}


@DIModule({
    imports: [
        ComponentsModule,
        ElementModule,
        Component1,
        Component3,
        CustomeService
    ],
    exports: [
        Component1,
        Component3,
        CustomeService
    ]
})
class SubModule2 {

}

@DIModule({
    imports: [
        SubModule2
    ],
    exports: [
        SubModule2
    ],
    bootstrap: Component1
})
class ComponentTestMd3 {

}



@Suite('component test')
export class CTest {

    ctx: BootContext;

    @Before()
    async init() {
        this.ctx = await BootApplication.run({ module: ComponentTestMd, template: { name: 'test', address: 'cd' } }, [ComponentsModule, ElementModule]);
    }

    @Test('can bind bootsrap component')
    async test1() {
        expect(this.ctx.getBootTarget() instanceof Component2).toBeTruthy();
        expect(this.ctx.getBootTarget().name).toEqual('test');
        expect(this.ctx.getBootTarget().address).toEqual('cd');
    }

    @Test('can resolve component template')
    async test2() {
        let container = this.ctx.getRaiseContainer();
        let comp1 = await container.get(ComponentBuilder).resolveTemplate({ template: { element: 'selector1', name: 'test1' } });
        let comp11 = await container.get(BuilderService).resolve(Component1, { template: { name: 'test1' } });
        console.log('comp1:', comp1);
        console.log('comp11:', comp11);
        expect(comp1 instanceof Component1).toBeTruthy();
        expect(comp11 instanceof Component1).toBeTruthy();
    }


    @Test('can resolve component template in sub module')
    async test3() {
        let container = this.ctx.getRaiseContainer();
        let service = container.resolve(CustomeService);
        expect(service instanceof CustomeService).toBeTruthy();
        let comp3 = await service.createComponent3() as Component3;
        console.log('comp3:', comp3);
        expect(comp3 instanceof Component3).toBeTruthy();
        expect(comp3.phone).toEqual('+86177000000010');
    }

    @Test('can resolve component template by sub module')
    async test4() {
        let ctx = await BootApplication.run({ module: ComponentTestMd2, template: { name: 'test', address: 'cd', phone: '17000000000' } });
        expect(ctx.getBootTarget() instanceof Component3).toBeTruthy();
        expect(ctx.getBootTarget().name).toEqual('test');
        expect(ctx.getBootTarget().address).toEqual('cd');
        expect(ctx.getBootTarget().phone).toEqual('17000000000');
    }


    @Test('can resolve component template in sub module by sub module')
    async test5() {
        let ctx = await BootApplication.run({ module: ComponentTestMd2, template: { name: 'test', address: 'cd', phone: '17000000000' } });
        let container = ctx.getRaiseContainer();
        // console.log(container);
        console.log(ctx.getBootTarget());
        expect(ctx.getBootTarget() instanceof Component3).toBeTruthy();
        expect(ctx.getBootTarget().phone).toEqual('17000000000');
        let service = container.resolve(CustomeService);
        expect(service instanceof CustomeService).toBeTruthy();
        let comp3 = await service.createComponent3() as Component3;
        console.log('comp3 :', comp3);
        expect(comp3 instanceof Component3).toBeTruthy();
        expect(comp3.phone).toEqual('+86177000000010');
    }

    @Test('can boot sub module component')
    async test6() {
        let ctx = await BootApplication.run({ module: ComponentTestMd3, template: { name: 'test', address: 'cd', phone: '17000000000' } });
        let container = ctx.getRaiseContainer();
        console.log(container.get(ContainerPoolToken).isRoot(container));
        // console.log(container);
        console.log(container.resolve(Component1));
        // console.log(ctx.getBootTarget());
        expect(ctx.getBootTarget() instanceof Component1).toBeTruthy();
        expect(ctx.getBootTarget().name).toEqual('test');
    }
}
