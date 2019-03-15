import { Token } from '@ts-ioc/ioc';
import { Runnable, RunnableOptions } from '../runnable';
import { BuildOptions } from './AnnoType';
import { AnnotationConfigure } from './AnnotationConfigure';
import { IContainer } from '@ts-ioc/core';
import { MetaAccessor } from '../services';

/**
 * Annotation class builder.
 *
 * @export
 * @interface IAnnotationBuilder
 */
export interface IAnnotationBuilder<T> {
    /**
     * container.
     *
     * @type {IContainer}
     * @memberof IAnnotationBuilder
     */
    container: IContainer;

    /**
     * build annotation class.
     *
     * @param {Token<T>} token
     * @param {BuildOptions<T>} [options]
     * @returns {Promise<T>}
     * @memberof IAnnotationBuilder
     */
    build(token: Token<T>, options?: BuildOptions<T>): Promise<T>;

    /**
     * build annotation class.
     *
     * @param {AnnotationConfigure<T>} config
     * @param {BuildOptions<T>} [options]
     * @returns {Promise<T>}
     * @memberof IAnnotationBuilder
     */
    build(config: AnnotationConfigure<T>, options?: BuildOptions<T>): Promise<T>;

    /**
     * build annotation class.
     *
     * @param {Token<T>} token
     * @param {AnnotationConfigure<T>} [config]
     * @param {BuildOptions<T>} [options]
     * @returns {Promise<T>}
     * @memberof IAnnotationBuilder
     */
    build(token: Token<T>, config: AnnotationConfigure<T>, options: BuildOptions<T>): Promise<T>;

    /**
     * get finally builder by token and config.
     *
     * @param {Token<T>} token
     * @param {AnnotationConfigure<T>} [config]
     * @param {BuildOptions<T>} [options]
     * @returns {IAnnotationBuilder<T>}
     * @memberof IAnnotationBuilder
     */
    getBuilder(token: Token<T>, config?: AnnotationConfigure<T>, options?: BuildOptions<T>): IAnnotationBuilder<T>;

    /**
     * create token instance.
     *
     * @param {Token<T>} token
     * @param {AnnotationConfigure<T>} config
     * @param {BuildOptions<T>} [options] the  build options to create instance.
     * @returns {Promise<T>}
     * @memberof IAnnotationBuilder
     */
    createInstance(token: Token<T>, config: AnnotationConfigure<T>, options?: BuildOptions<T>): Promise<T>;

    /**
     * run runable.
     *
     * @param {AnnotationConfigure<T>} runable
     * @param {BuildOptions<T>} [options] the build options build instance.
     * @returns {Promise<Runnable<T>>}
     * @memberof IAnnotationBuilder
     */
    boot(runable: AnnotationConfigure<T>, options?: BuildOptions<T>): Promise<Runnable<T>>;

    /**
     * run runable.
     *
     * @param {Token<T>} runable
     * @param {BuildOptions<T>} [options]
     * @returns {Promise<Runnable<T>>}
     * @memberof IAnnotationBuilder
     */
    boot(runable: Token<T>, options?: BuildOptions<T>): Promise<Runnable<T>>;

    /**
     * run runable.
     *
     * @param {Token<T>} runable
     * @param {AnnotationConfigure<T>} config
     * @param {BuildOptions<T>} options the build options build instance.
     * @returns {Promise<Runnable<T>>}
     * @memberof IAnnotationBuilder
     */
    boot(runable: Token<T>, config: AnnotationConfigure<T>, options: BuildOptions<T>): Promise<Runnable<T>>;

    /**
     * resolve runnable.
     *
     * @param {T} instance
     * @param {RunnableOptions<T>} runableOptions
     * @param {BuildOptions<T>} [options]
     * @returns {Runnable<T>}
     * @memberof IAnnotationBuilder
     */
    resolveRunable(instance: T, runableOptions: RunnableOptions<T>, options?: BuildOptions<T>): Runnable<T>;


    /**
     * get meta accessor.
     *
     * @param {Token<any>} token
     * @returns {MetaAccessor}
     * @memberof IAnnotationBuilder
     */
    getMetaAccessor(token: Token<any>): MetaAccessor;
    /**
     * get meta accessor.
     *
     * @param {AnnotationConfigure<T>} config
     * @returns {MetaAccessor}
     * @memberof IAnnotationBuilder
     */
    getMetaAccessor(config: AnnotationConfigure<T>): MetaAccessor;
    /**
     * get meta accessor.
     *
     * @param {Token<any>} token
     * @param {AnnotationConfigure<T>} config
     * @returns {MetaAccessor}
     * @memberof IAnnotationBuilder
     */
    getMetaAccessor(token: Token<any>, config: AnnotationConfigure<T>): MetaAccessor;
}
