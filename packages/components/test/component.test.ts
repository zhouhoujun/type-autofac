import { DIModule, BootApplication, BootContext, BuilderService, HandleRegisterer, ParentContainerToken, ContainerPoolToken } from '@tsdi/boot';
import { Suite, Test, Before } from '@tsdi/unit';
import { Component, Input, ComponentsModule, ElementModule, ComponentBuilder, ComponentSelectorHandle, RefChild, NonSerialize, ElementNode } from '../src';
import expect = require('expect');
import { Inject, Injectable, Autorun } from '@tsdi/ioc';
import { IContainer, ContainerToken } from '@tsdi/core';


@Component('selector1')
class Component1 {
    @Input() name: string;
    @Input() selector: string;

    constructor() {

    }
}


@Component('selector2')
class Component2 extends Component1 {
    @Input('test', 'default test') defaultTest: string;
    @Input() address: string;
}


@Component({
    selector: 'comp',
    template: [
        {
            element: 'selector1',
            selector: 'comp1',
            name: 'binding=: name'
        },
        {
            element: 'selector2',
            selector: 'cmp2',
            name: 'binding: name',
            address: 'binding: address'
        }
    ]
})
class Components {

    @Input() name: string;

    @NonSerialize()
    @Input()
    address: string;

    @RefChild('comp1') cmp1: Component1;

    @RefChild() cmp2: Component2;

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



@Component({
    selector: 'obj-comp',
    template: [
        {
            element: 'selector1',
            selector: 'comp1',
            name: 'binding=: options.name'
        },
        {
            element: 'selector2',
            selector: 'cmp2',
            name: 'binding: options.name',
            address: 'binding: options.address'
        }
    ]
})
class ObjectComponent {

    @Input() options: any;

    @RefChild('comp1') cmp1: Component1;

    @RefChild() cmp2: Component2;

}

@DIModule({
    imports: [
        Component1,
        Component2,
        ObjectComponent,
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



@Component('list')
class ListBox {
    @Input(ElementNode) items: ElementNode[];
}

@Component('columnDef')
class ColumnDef {
    @Input() name: string;
    @Input() field: string;
    @Input() type: string;
}

@Component('columns')
class Columns {
    @Input(ColumnDef) defs: ColumnDef[];
}

@DIModule({
    imports: [
        ComponentsModule,
        ElementModule,
        ListBox,
        Columns,
        ColumnDef
    ]
})
class ListModule {

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
        expect(this.ctx.getBootTarget().defaultTest).toEqual('default test');
        expect(this.ctx.getBootTarget().address).toEqual('cd');
    }

    @Test('can resolve component template')
    async test2() {
        let container = this.ctx.getContainer();
        let comp1 = await container.get(ComponentBuilder).resolveTemplate({ template: { element: 'selector1', name: 'test1' } });
        let comp11 = await container.get(BuilderService).resolve(Component1, { template: { name: 'test1' } });
        console.log('comp1:', comp1);
        console.log('comp11:', comp11);
        expect(comp1 instanceof Component1).toBeTruthy();
        expect(comp11 instanceof Component1).toBeTruthy();
    }

    @Test('can run component template')
    async testRun() {

        let ctx = await BootApplication.run({
            deps: [ComponentsModule, ElementModule, Component1],
            template: { element: 'selector1', name: 'test1' }
        });

        let comp1 = ctx.getBootTarget();
        expect(comp1 instanceof Component1).toBeTruthy();
        expect(comp1.name).toEqual('test1');
    }


    @Test('can resolve component template in sub module')
    async test3() {
        let container = this.ctx.getContainer();
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
        let container = ctx.getContainer();
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
        console.log(container.get(ComponentBuilder).serialize(comp3))
    }

    @Test('can boot sub module component')
    async test6() {
        let ctx = await BootApplication.run({ module: ComponentTestMd3, template: { name: 'test', address: 'cd', phone: '17000000000' } });
        let container = ctx.getContainer();
        console.log(container.get(ContainerPoolToken).isRoot(container));
        // console.log(container);
        console.log(container.resolve(Component1));
        // console.log(ctx.getBootTarget());
        expect(ctx.getBootTarget() instanceof Component1).toBeTruthy();
        expect(ctx.getBootTarget().name).toEqual('test');
    }

    @Test('can get refchild')
    async test7() {
        let ctx = await BootApplication.run({ module: ComponentTestMd2, template: { name: 'test', address: 'cd', phone: '17000000000' } });
        let container = ctx.getContainer();
        expect(ctx.getBootTarget() instanceof Component3).toBeTruthy();
        expect(ctx.getBootTarget().phone).toEqual('17000000000');
        let comp = await container.get(ComponentBuilder)
            .resolveTemplate({ template: { element: 'comp', name: 'test111', address: 'cd111' } }) as Components;
        expect(comp instanceof Components).toBeTruthy();
        expect(comp.name).toEqual('test111');
        expect(comp.address).toEqual('cd111');
        // console.log('comp:', comp);
        expect(comp.cmp1 instanceof Component1).toBeTruthy();
        expect(comp.cmp2 instanceof Component2).toBeTruthy();
        expect(comp.cmp1.name).toEqual('test111');
        expect(comp.cmp2.name).toEqual('test111');
        expect(comp.cmp2.address).toEqual('cd111');
        let json = container.get(ComponentBuilder).serialize(comp);
        console.log(json);
        expect(json.element).toEqual('comp');
        expect(json.name).toEqual('test111');
        expect(json.address).toBeUndefined();
    }

    @Test('can get refchild, two way binding name')
    async test8() {
        let ctx = await BootApplication.run({ module: ComponentTestMd2, template: { name: 'test', address: 'cd', phone: '17000000000' } });
        let container = ctx.getContainer();
        expect(ctx.getBootTarget() instanceof Component3).toBeTruthy();
        expect(ctx.getBootTarget().phone).toEqual('17000000000');
        let comp = await container.get(ComponentBuilder)
            .resolveTemplate({ template: { element: 'comp', name: 'test111', address: 'cd111' } }) as Components;
        expect(comp instanceof Components).toBeTruthy();
        expect(comp.name).toEqual('test111');
        expect(comp.address).toEqual('cd111');
        // console.log('comp:', comp);
        expect(comp.cmp1 instanceof Component1).toBeTruthy();
        expect(comp.cmp2 instanceof Component2).toBeTruthy();
        expect(comp.cmp1.name).toEqual('test111');
        expect(comp.cmp2.name).toEqual('test111');
        expect(comp.cmp2.address).toEqual('cd111');
        comp.cmp1.name = 'twoway-bind';
        expect(comp.name).toEqual('twoway-bind');
        expect(comp.cmp2.name).toEqual('twoway-bind');
        comp.cmp2.name = 'oneway-bind';
        expect(comp.name).toEqual('twoway-bind');
        expect(comp.cmp2.name).toEqual('oneway-bind');
    }

    @Test('can binding sub field')
    async test9() {
        let container = this.ctx.getContainer();
        let comp = await container.get(ComponentBuilder).resolveTemplate({
            template: {
                element: 'obj-comp',
                options: { name: 'testobject', address: 'chengdu' }
            }
        }) as ObjectComponent;

        expect(comp.options.name).toEqual('testobject');
        expect(comp.options.address).toEqual('chengdu');
        // console.log('comp:', comp);
        expect(comp.cmp1 instanceof Component1).toBeTruthy();
        expect(comp.cmp2 instanceof Component2).toBeTruthy();
        expect(comp.cmp1.name).toEqual('testobject');
        expect(comp.cmp2.name).toEqual('testobject');
        expect(comp.cmp2.address).toEqual('chengdu');
        comp.cmp1.name = 'twoway-bind';
        expect(comp.options.name).toEqual('twoway-bind');
        expect(comp.cmp2.name).toEqual('twoway-bind');
        comp.cmp2.name = 'oneway-bind';
        expect(comp.options.name).toEqual('twoway-bind');
        expect(comp.cmp2.name).toEqual('oneway-bind');
    }


    //     @Component('columnDef')
    // class ColumnDef {
    //     @Input() name: string;
    //     @Input() field: string;
    //     @Input() type: string;
    // }
    @Test('can run component template deep arr')
    async test_deep_arr() {

        let ctx = await BootApplication.run({
            deps: [ListModule],
            template: {
                element: 'list',
                items: [
                    {
                        element: 'columns',
                        defs: [
                            {
                                element: 'columnDef',
                                name: 'name',
                                field: 'name',
                                type: 'string'
                            },
                            {
                                element: 'columnDef',
                                name: 'phone',
                                field: 'phone',
                                type: 'string'
                            }
                        ]
                    }
                ]
            }
        });

        let comp1 = ctx.getBootTarget() as ListBox;
        expect(comp1 instanceof ListBox).toBeTruthy();
        expect(comp1.items.length).toEqual(1);
        console.log(comp1.items[0]);
    }
}
