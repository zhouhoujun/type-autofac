import { IocResolveAction } from '@tsdi/ioc';
import { ResolveServicesContext } from './ResolveServicesContext';


export abstract class IocResolveServicesAction extends IocResolveAction {
    abstract execute(ctx: ResolveServicesContext<any>, next: () => void): void;
}