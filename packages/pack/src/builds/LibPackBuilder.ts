import { Task, TemplateOption, Expression, Src, Activities } from '@tsdi/activities';
import { BuilderTypes } from './BuilderTypes';
import { TsBuildOption } from '../transforms';
import { CompilerOptions } from 'typescript';
import { ExternalOption, RollupCache, WatcherOptions, RollupFileOptions, RollupDirOptions, GlobalsOption } from 'rollup';
import { RollupOption } from '../rollups';
import { Input, AfterInit, Binding } from '@tsdi/boot';
import { PlatformService, NodeActivityContext } from '../core';
const resolve = require('rollup-plugin-node-resolve');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('rollup-plugin-commonjs');
const ts = require('rollup-plugin-typescript');
import { uglify } from 'rollup-plugin-uglify';
import { rollupClassAnnotations } from '@tsdi/annotations';
import { isString, isBoolean, isNullOrUndefined } from '@tsdi/ioc';

export interface LibTaskOption {
    clean?: Src;
    src?: Src;
    dist?: Src;
    uglify?: boolean;
    tsconfig?: string | CompilerOptions;

    /**
     * rollup input.
     *
     * @type {string>>}
     * @memberof LibTaskOption
     */
    input?: string;
    /**
     * rollup output file.
     *
     * @type {string>}
     * @memberof LibTaskOption
     */
    outputFile?: string;
    /**
     * rollup output dir.
     *
     * @type {string>}
     * @memberof LibTaskOption
     */
    outputDir?: string;
    /**
     * rollup format option.
     *
     * @type {string>}
     * @memberof LibTaskOption
     */
    format?: string;
}

export interface LibPackBuilderOption extends TemplateOption {
    /**
     * tasks
     *
     * @type {(Expression<LibTaskOption|LibTaskOption[]>)}
     * @memberof LibPackBuilderOption
     */
    tasks?: Binding<Expression<LibTaskOption | LibTaskOption[]>>;
    /**
     * rollup external setting.
     *
     * @type {Expression<ExternalOption>}
     * @memberof RollupOption
     */
    external?: Binding<Expression<ExternalOption>>;

    /**
     * enable source maps or not.
     *
     * @type {Binding<Expression<boolean>>}
     * @memberof RollupOption
     */
    sourceMap?: Binding<Expression<boolean>>;

    /**
     * rollup plugins setting.
     *
     * @type {Expression<Plugin[]>}
     * @memberof RollupOption
     */
    plugins?: Binding<Expression<Plugin[]>>;

    cache?: Binding<Expression<RollupCache>>;

    watch?: Binding<Expression<WatcherOptions>>;

    globals?: Binding<Expression<GlobalsOption>>;
    /**
     * custom setup rollup options.
     *
     * @type {(Expression<RollupFileOptions | RollupDirOptions>)}
     * @memberof RollupOption
     */
    options?: Binding<Expression<RollupFileOptions | RollupDirOptions>>;
}

@Task({
    selector: BuilderTypes.libs,
    template: {
        activity: 'each',
        each: 'binding: tasks',
        body: [
            {
                activity: 'if',
                condition: ctx => ctx.body.src,
                body: <TsBuildOption>{
                    activity: 'ts',
                    clean: ctx => ctx.body.clean,
                    src: ctx => ctx.body.src,
                    test: ctx => ctx.body.test,
                    uglify: ctx => ctx.body.uglify,
                    dist: ctx => ctx.body.dist,
                    annotation: true,
                    sourcemaps: './sourcemaps',
                    tsconfig: ctx => ctx.body.tsconfig
                }
            },
            {
                activity: Activities.if,
                condition: ctx => ctx.body.input,
                body: <RollupOption>{
                    activity: 'rollup',
                    input: ctx => ctx.body.input,
                    sourceMap: 'binding: sourceMap',
                    plugins: 'binding: plugins',
                    external: 'binding: external',
                    options: 'binding: options',
                    output: ctx => {
                        return {
                            format: ctx.body.format || 'cjs',
                            file: ctx.body.outputFile,
                            dir: ctx.body.outputDir,
                            globals: ctx.scope.globals
                        }
                    }
                }
            }
        ]
    }
})
export class LibPackBuilder implements AfterInit {

    constructor(private platform: PlatformService) {

    }

    /**
     * tasks
     *
     * @type {(Expression<LibTaskOption|LibTaskOption[]>)}
     * @memberof LibPackBuilderOption
     */
    @Input()
    tasks: Expression<LibTaskOption | LibTaskOption[]>;
    /**
     * rollup external setting.
     *
     * @type {Expression<ExternalOption>}
     * @memberof RollupOption
     */
    @Input()
    external?: Expression<ExternalOption>;

    @Input()
    sourceMap?: Expression<boolean>;
    /**
     * rollup plugins setting.
     *
     * @type {Expression<Plugin[]>}
     * @memberof RollupOption
     */
    @Input()
    plugins: Expression<Plugin[]>;

    @Input()
    globals: Expression<GlobalsOption>;

    @Input()
    cache?: Expression<RollupCache>;

    @Input()
    watch?: Expression<WatcherOptions>;
    /**
     * custom setup rollup options.
     *
     * @type {(Expression<RollupFileOptions | RollupDirOptions>)}
     * @memberof RollupOption
     */
    @Input()
    options?: Expression<RollupFileOptions | RollupDirOptions>;

    async onAfterInit(): Promise<void> {
        if (!this.external) {
            this.external = [
                'process', 'util', 'path', 'fs', 'events', 'stream', 'child_process', 'os',
                ...Object.keys(this.platform.getPackage().dependencies || {})];
            if (this.external.indexOf('rxjs')) {
                this.external.push('rxjs/operators')
            }
            this.globals = this.globals || {};
            this.external.forEach(k => {
                if (!this.globals[k]) {
                    this.globals[k] = k;
                }
            });
        }

        if (!this.plugins) {
            if (isNullOrUndefined(this.sourceMap)) {
                this.sourceMap = true;
            }
            this.plugins = (ctx: NodeActivityContext) => [
                resolve(),
                commonjs(),
                rollupClassAnnotations(),
                rollupSourcemaps(),
                ts(isString(ctx.body.tsconfig) ? ctx.platform.getCompilerOptions(ctx.body.tsconfig) : ctx.body.tsconfig),
                ctx.body.uglify ? uglify(isBoolean(ctx.body.uglify) ? undefined : ctx.body.uglify) : null
            ];
        }
    }

}
