import { Type, ObjectMap, Provider } from '@tsdi/ioc';
import { Advices } from './advices/Advices';
import { AdviceMetadata } from './metadatas';

/**
 * aspect and advices manager.
 *
 * @export
 * @interface IAdvisor
 */
export interface IAdvisor {
    /**
     * aspects
     *
     * @type {Map<Type, ObjectMap<AdviceMetadata[]>>}
     * @memberof IAdvisor
     */
    aspects: Map<Type, ObjectMap<AdviceMetadata[]>>;
    /**
     * advices
     *
     * @type {Map<Type, Map<string, Advices>>}
     * @memberof IAdvisor
     */
    advices: Map<Type, Map<string, Advices>>;

    /**
     * set advices.
     *
     * @param {Type} type
     * @param {string} key
     * @param {Advices} advices
     * @memberof IAdvisor
     */
    setAdvices(type: Type, key: string, advices: Advices);

    /**
     * the type has advices or not.
     * @param type
     */
    hasAdvices(type: Type): boolean;
    /**
     * get advices.
     *
     * @param {Type} type
     * @returns {Advices}
     * @memberof IAdvisor
     */
    getAdviceMap(type: Type): Map<string, Advices>;
    /**
     * get advices.
     *
     * @param {Type} type
     * @param {string} key
     * @returns {Advices}
     * @memberof IAdvisor
     */
    getAdvices(type: Type, key: string): Advices;

    /**
     * add aspect.
     *
     * @param {Type} aspect
     * @param {IIocContainer} raiseContainer
     * @memberof IAdvisor
     */
    add(aspect: Type);

    /**
     * resolve aspect.
     *
     * @template T
     * @param {Type<T>} aspect
     * @param {...Provider[]} providers
     * @returns {T}
     * @memberof IAdvisor
     */
    resolve<T>(aspect: Type<T>, ...providers: Provider[]): T;
}
