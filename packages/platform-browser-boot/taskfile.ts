import { Workflow } from '@tsdi/activities';
import { Asset, AssetActivity, CleanToken, TsCompile, TransformContext } from '@tsdi/build';
import { Pack, PackActivity, PackModule } from '@tsdi/pack';

const resolve = require('rollup-plugin-node-resolve');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('rollup-plugin-commonjs');
// import { rollup } from 'rollup';
const rollup = require('gulp-rollup');
const rename = require('gulp-rename');

@Asset({
    src: 'lib/**/*.js',
    dest: 'bundles',
    data: {
        name: 'platform-browser-boot.umd.js',
        input: 'lib/index.js'
    },
    sourcemaps: true,
    pipes: [
        (ctx: TransformContext) => rollup({
            name: ctx.config.data.name,
            format: 'umd',
            sourceMap: true,
            plugins: [
                resolve(),
                commonjs(),
                rollupSourcemaps()
            ],
            external: [
                'reflect-metadata',
                'tslib',
                'core-js',
                '@tsdi/core',
                '@tsdi/aop',
                '@tsdi/boot',
                '@tsdi/platform-browser'

            ],
            globals: {
                'reflect-metadata': 'Reflect',
                'tslib': 'tslib',
                'core-js': 'core-js',
                '@tsdi/core': '@tsdi/core',
                '@tsdi/aop': '@tsdi/aop',
                '@tsdi/boot': '@tsdi/boot',
                '@tsdi/platform-browser': '@tsdi/platform-browser'
            },
            input: ctx.relativeRoot(ctx.config.data.input)
        }),
        (act) => rename(act.config.data.name)
    ]
})
export class BootRollup extends AssetActivity {
}

@Pack({
    baseURL: __dirname,
    src: 'src',
    test: 'test/**/*.spec.ts',
    clean: ['lib', 'bundles', 'fesm5', 'es2015', 'fesm2015'],
    assets: {
        ts: {
            sequence: [
                { src: 'src/**/*.ts', dest: 'lib', annotation: true, uglify: false, activity: TsCompile },
                BootRollup,
                {
                    name: 'zip',
                    src: 'bundles/platform-browser-boot.umd.js',
                    dest: 'bundles',
                    sourcemaps: true,
                    uglify: true,
                    pipes: [
                        () => rename('platform-browser-boot.umd.min.js')
                    ],
                    task: AssetActivity
                },
                {
                    src: 'lib/**/*.js', dest: 'fesm5',
                    data: {
                        name: 'platform-browser-boot.js',
                        input: 'lib/index.js',
                        format: 'cjs'
                    },
                    activity: BootRollup
                }
            ]
        },
        ts2015: {
            sequence: [
                { src: 'src/**/*.ts', dest: 'es2015', tds: false, annotation: true, uglify: false, tsconfig: './tsconfig.es2015.json', activity: TsCompile },
                {
                    src: 'es2015/**/*.js',
                    dest: 'fesm2015',
                    data: {
                        name: 'platform-browser-activities.js',
                        input: './es2015/index.js',
                        format: 'cjs'
                    }, activity: BootRollup
                }
            ]
        }
    }
})
export class PfBrowserBootBuilder extends PackActivity {
}

if (process.cwd() === __dirname) {
    Workflow.create()
        .use(PackModule)
        .bootstrap(PfBrowserBootBuilder);
}