import {
    IContainer, Singleton, Inject, MethodMetadata, getOwnMethodMetadata,
    MapSet, Type, ObjectMap, getClassName, lang, ContainerToken
} from '@ts-ioc/core';
import { Advices, Advicer } from './advices/index';
import { Aspect, Advice, NonePointcut } from './decorators/index';
import { AdviceMetadata } from './metadatas/index';
import { IAdvisor, AdvisorToken } from './IAdvisor';

/**
 * for global aop advisor.
 *
 * @export
 * @class Advisor
 */
@NonePointcut()
@Singleton(AdvisorToken)
export class Advisor implements IAdvisor {
    /**
     * aspects.
     *
     * @type {MapSet<Type<any>, ObjectMap<AdviceMetadata[]>>}
     * @memberof AspectManager
     */
    aspects: MapSet<Type<any>, ObjectMap<AdviceMetadata[]>>;
    /**
     * method advices.
     *
     * @type {MapSet<string, Advices>}
     * @memberof AspectManager
     */
    advices: MapSet<string, Advices>;


    constructor(@Inject(ContainerToken) private container: IContainer) {
        this.aspects = new MapSet<Type<any>, ObjectMap<AdviceMetadata[]>>();
        this.advices = new MapSet<string, Advices>();
    }

    setAdvices(key: string, advices: Advices) {
        if (!this.advices.has(key)) {
            this.advices.set(key, advices);
        }
    }

    getAdvices(key: string) {
        if (!this.advices.has(key)) {
            return null;
        }
        return this.advices.get(key);
    }

    hasRegisterAdvices(targetType: Type<any>): boolean {
        let methods = lang.keys(Object.getOwnPropertyDescriptors(targetType.prototype));
        let className = getClassName(targetType);
        return methods.some(m => this.advices.has(`${className}.${m}`));
    }

    add(aspect: Type<any>) {
        if (!this.aspects.has(aspect)) {
            let metas = getOwnMethodMetadata<AdviceMetadata>(Advice, aspect);
            this.aspects.set(aspect, metas);
        }
    }
}
