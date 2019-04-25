import { Token, SymbolType, Registration, InjectToken, IIocContainer } from '@tsdi/ioc';
import { IContainer, IContainerBuilder } from '@tsdi/core';
import { BootModule } from './BootModule';

/**
 * root container token.
 */
export const RootContainerToken = new InjectToken<IContainer>('__ioc_root_container');
/**
 * parent container token.
 */
export const ParentContainerToken = new InjectToken<IContainer>('__ioc_parent_container');
/**
 * children container token.
 */
export const ChildrenContainerToken = new InjectToken<IContainer[]>('__ioc_children_container');
/**
 *  container pool token.
 */
export const ContainerPoolToken = new InjectToken<ContainerPool>('DI_ContainerPool');

/**
 * container pool
 *
 * @export
 * @class ContainerPool
 */
export class ContainerPool {
    protected pools: IContainer[];
    protected root: IContainer;
    constructor(protected containerBuilder: IContainerBuilder) {
        this.pools = [];
        this.createContainer();
    }

    protected createContainer(parent?: IContainer): IContainer {
        let container = parent ? parent.getBuilder().create() : this.containerBuilder.create();
        this.pools.push(container);
        if (!this.root) {
            this.root = container;
        } else {
            this.setParent(container, parent || this.root);
        }

        container.bindProvider(RootContainerToken, this.root);
        container.bindProvider(ContainerPoolToken, () => this);
        container.bindProvider(ContainerPool, () => this);
        container.register(BootModule);
        return container;
    }

    getTokenKey(token: Token<any>): SymbolType<any> {
        if (token instanceof Registration) {
            return token.toString();
        }
        return token;
    }

    isRoot(container: IContainer): boolean {
        return container === this.root;
    }


    getRoot(): IContainer {
        return this.root;
    }

    getContainers(): IContainer[] {
        return this.pools;
    }

    has(container: IContainer): boolean {
        return this.pools.indexOf(container) >= 0;
    }

    hasParent(container: IContainer): boolean {
        return container && container.has(ParentContainerToken);
    }


    create(parent?: IContainer): IContainer {
        let container = this.createContainer(parent);
        return container;
    }

    setParent(container: IContainer, parent?: IContainer) {
        if (this.isRoot(container)) {
            return;
        }
        if (!container.has(ContainerPoolToken)) {
            container.bindProvider(ContainerPoolToken, () => this);
            container.bindProvider(ContainerPool, () => this);
        }
        parent = parent || this.root;
        if (parent !== container) {
            container.bindProvider(ParentContainerToken, parent);
        }
    }

    getParent(container: IIocContainer): IContainer {
        return container.resolve(ParentContainerToken);
    }

    iterator(express: (resolvor?: IContainer) => void | boolean): void | boolean {
        return !this.pools.some(r => {
            if (express(r) === false) {
                return true;
            }
            return false;
        })
    }
}
