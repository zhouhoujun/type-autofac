import { PackModule, Pack, PackActivity } from '@ts-ioc/pack';
import { Workflow } from '@ts-ioc/activities';
import { Asset, AssetActivity, TsCompile, CleanToken, TransformContext } from '@ts-ioc/build';
const localResolve = require('rollup-plugin-local-resolve');
const resolve = require('rollup-plugin-node-resolve');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('rollup-plugin-commonjs');
const rollup = require('gulp-rollup');
const rename = require('gulp-rename');

@Asset({
    src: 'lib/**/*.js',
    dest: 'bundles',
    data: {
        name: 'core.umd.js',
        input: 'lib/index.js'
    },
    sourcemaps: true,
    pipes: [
        (ctx: TransformContext) => rollup({
            name: ctx.config.data.name,
            format: 'umd',
            sourceMap: true,
            plugins: [
                localResolve(),
                resolve(),
                commonjs(),
                rollupSourcemaps()
            ],
            external: [
                'reflect-metadata',
                'tslib',
                '@ts-ioc/core'
            ],
            globals: {
                'reflect-metadata': 'Reflect',
                'tslib': 'tslib',
                '@ts-ioc/core': '@ts-ioc/core'
            },
            input: ctx.relativeRoot(ctx.config.data.input)
        }),
        (ctx) => rename(ctx.config.data.name)
    ]
})
export class CoreRollup {
}

@Pack({
    baseURL: __dirname,
    clean: ['lib', 'bundles', 'es2015', 'es2017'],
    test: (ctx) => ctx.getEnvArgs().test === 'false' ? '' : 'test/**/*.spec.ts',
    assets: {
        ts: {
            sequence: [
                { src: 'src/**/*.ts', dest: 'lib', annotation: true, uglify: false, activity: TsCompile },
                CoreRollup,
                {
                    name: 'zip',
                    src: 'bundles/core.umd.js',
                    dest: 'bundles',
                    sourcemaps: true,
                    uglify: true,
                    pipes: [
                        () => rename('core.umd.min.js')
                    ],
                    task: AssetActivity
                }
            ]
        },
        ts2015: {
            sequence: [
                { src: 'src/**/*.ts', dest: 'esnext', annotation: true, uglify: false, tsconfig: './tsconfig.es2015.json', activity: TsCompile },
                { src: 'esnext/**/*.js', dest: 'es2015', data: { name: 'core.js', input: './esnext/index.js' }, activity: CoreRollup }
            ]
        },
        es2017: {
            sequence: [
                { clean: 'esnext', activity: CleanToken },
                { src: 'src/**/*.ts', dest: 'esnext', annotation: true, uglify: false, tsconfig: './tsconfig.es2017.json', activity: TsCompile },
                { src: 'esnext/**/*.js', dest: 'es2017', data: { name: 'core.js', input: './esnext/index.js' }, activity: CoreRollup },
                { clean: 'esnext', activity: CleanToken }
            ]
        }
    }
})
export class CoreBuilder {
}

if (process.cwd() === __dirname) {
    Workflow.create()
        .use(PackModule)
        .bootstrap(CoreBuilder);
}
