import { BuildHandleContext } from './BuildHandleActivity';
import { IActivity, Src, ActivityConfigure } from '@taskfr/core';
import { Registration, Token } from '@ts-ioc/core';

/**
 * compiler activity
 *
 * @export
 * @interface ICompiler
 * @extends {IActivity}
 */
export interface ICompiler extends IActivity {

}



/**
 * compiler configure.
 *
 * @export
 * @interface CompilerConfigure
 * @extends {ActivityConfigure}
 */
export interface CompilerConfigure extends ActivityConfigure {

}

/**
 * inject compiler token.
 *
 * @export
 * @class InjectCompilerToken
 * @extends {Registration<T>}
 * @template T
 */
export class InjectCompilerToken<T extends ICompiler> extends Registration<T> {
    constructor(type: Token<any>) {
        super(type, 'compiler');
    }
}


/**
 * compiler token.
 */
export const CompilerToken = new InjectCompilerToken<ICompiler>('handle');


/**
 * source compiler.
 *
 * @export
 * @interface ISourceCompiler
 * @extends {ICompiler}
 */
export interface ISourceCompiler extends ICompiler {
    /**
     * get source.
     *
     * @returns {Promise<Src>}
     * @memberof ISourceCompiler
     */
    getSource(): Promise<Src>;
}

/**
 * dest compiler.
 *
 * @export
 * @interface IDestCompiler
 * @extends {ICompiler}
 */
export interface IDestCompiler extends ICompiler {
    /**
     * get compiler to dist.
     *
     * @returns {Promise<string>;}
     * @memberof IDestCompiler
     */
    getDest(): Promise<string>;
}

/**
 * annotation compiler.
 *
 * @export
 * @interface IAnnotationCompiler
 * @extends {ICompiler}
 */
export interface IAnnotationCompiler extends ICompiler {

}

/**
 * sourcemaps compiler
 *
 * @export
 * @interface ISourcemapCompiler
 * @extends {ICompiler}
 */
export interface ISourcemapsCompiler extends ICompiler {
    /**
     * init sourcemaps.
     *
     * @param {BuildHandleContext<any>} ctx
     * @memberof ISourcemapsCompiler
     */
    init(ctx: BuildHandleContext<any>);
    /**
     * write sourcemaps.
     *
     * @param {BuildHandleContext<any>} ctx
     * @memberof ISourcemapsCompiler
     */
    write(ctx: BuildHandleContext<any>);
}