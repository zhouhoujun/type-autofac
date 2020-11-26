import {
    Type, MethodMetadata, ClassMetadata, IProvider, tokenId, Token,
    isNullOrUndefined, IocContext, IInjector, PROVIDERS, ParameterMetadata, getTokenKey
} from '@tsdi/ioc';
import { JoinpointState } from './state';
import { Advices } from '../advices/Advices';
import { Advicer } from '../advices/Advicer';


export interface JoinpointOption {
    provJoinpoint?: Joinpoint;
    name: string;
    fullName: string;
    params: ParameterMetadata[];
    originMethod?: Function;
    args: any[];
    state?: JoinpointState;
    advices: Advices;
    annotations?: (ClassMetadata | MethodMetadata)[];
    target?: any;
    targetType: Type;
    providers?: IProvider;
}


export const AOP_METHOD_ANNOTATIONS = tokenId<any[]>('AOP_METHOD_ANNOTATIONS');


/**
 * Join point data.
 *
 * @export
 * @class Joinpoint
 * @implements {IJoinpoint}
 */
export class Joinpoint implements IocContext {
    /**
     * method name
     *
     * @type {string}
     */
    name: string;

    /**
     * prov joinpoint.
     *
     * @type {IJoinpoint}
     */
    provJoinpoint: Joinpoint;

    /**
     * full name.
     *
     * @type {string}
     */
    fullName: string;

    originMethod: Function;

    /**
     * join point state.
     *
     * @type {JoinpointState}
     */
    state: JoinpointState;

    /**
     * params of pointcut.
     *
     * @type {ParameterMetadata[]}
     */
    params: ParameterMetadata[];

    /**
     * args of pointcut.
     *
     * @type {any[]}
     */
    args: any[];
    /**
     * pointcut origin returing
     *
     * @type {*}
     */
    returning: any;

    /**
     * to reset returning for AfterReturning, Around advice.
     */
    resetReturning?: any;

    /**
     * pointcut throwing error.
     *
     * @type {*}
     */
    throwing: Error;

    /**
     * advicer of joinpoint
     *
     * @type {Advicer}
     */
    advices: Advices;

    /**
     * orgin pointcut method metadatas.
     *
     * @type {any[]}
     */
    get annotations(): any[] {
        return this.routeValue(AOP_METHOD_ANNOTATIONS);
    }
    /**
     * set annotations.
     */
    set annotations(meta: any[]) {
        this.providers.setValue(AOP_METHOD_ANNOTATIONS, meta);
    }

    invokeHandle: (joinPoint: Joinpoint, advicer: Advicer) => any;

    /**
     * pointcut target instance
     *
     * @type {*}
     */
    target: any;

    /**
     * pointcut target type.
     *
     * @type {Type}
     */
    targetType: Type;

    private pdr: IProvider;
    set providers(pdr: IProvider) {
        this.pdr.inject(pdr);
        // reset
        this.pdr.inject({ provide: Joinpoint, useValue: this });
    }
    get providers(): IProvider {
        return this.pdr;
    }


    constructor(public injector: IInjector) {
        this.pdr = injector.get(PROVIDERS);
        this.pdr.inject({ provide: Joinpoint, useValue: this });
    }

    routeValue<T>(token: Token<T>): T {
        let value: T;
        let currj: Joinpoint = this;
        let key = getTokenKey(token);
        while (isNullOrUndefined(value) && currj) {
            value = currj.providers?.get(key);
            currj = currj.provJoinpoint;
        }
        return value;
    }

    getProvProviders(): IProvider[] {
        let pdrs: IProvider[] = [];
        let currj: Joinpoint = this.provJoinpoint;
        while (currj) {
            let pdr = currj.providers;
            if (pdr && pdr.size) {
                pdrs.push(pdr);
            }
            currj = currj.provJoinpoint;
        }
        return pdrs;
    }

    /**
     * create resolve context via options.
     *
     * @static
     * @param {IInjector} injector
     * @param {ResolveActionOption} options
     * @returns {ResolveActionContext}
     */
    static parse<T>(injector: IInjector, options: JoinpointOption): Joinpoint {
        let jpt = new Joinpoint(injector);
        jpt = Object.assign(jpt, options);
        return jpt;
    }
}
