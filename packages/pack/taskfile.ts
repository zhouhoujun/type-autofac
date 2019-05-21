import { Workflow, Task } from '@tsdi/activities';
import { PackModule, PackMetadata, LibPackBuilderOption } from '@tsdi/pack';
import { ServerActivitiesModule } from '@tsdi/platform-server-activities';
import { AfterInit } from '@tsdi/boot';

@Task({
    deps: [
        PackModule,
        ServerActivitiesModule
    ],
    baseURL: __dirname,
    template: <LibPackBuilderOption>{
        activity: 'libs',
        src: 'src/**/*.ts',
        outDir: '../../dist/pack',
        annotation: true,
        bundles: [
            { target: 'es5', targetFolder: 'src', moduleName: ['esm5'], moduleFolder: 'lib', outputFile: 'index.js', dtsMain: 'index.d.ts' },
            { input: 'src/index.js', moduleName: ['main', 'fesm5'], outputFile: 'pack.js', format: 'cjs' },
            { target: 'es2015', input: 'es2015/index.js', moduleName: 'fesm2015', outputFile: 'pack.js', format: 'cjs' },
            { target: 'es2017', input: 'es2017/index.js', moduleName: 'fesm2017', outputFile: 'pack.js', format: 'cjs' }
        ]
    }
})
export class PackBuilder implements AfterInit {
    onAfterInit(): void | Promise<void> {
        console.log('pack build has inited...')
    }
}

if (process.cwd() === __dirname) {
    Workflow.run(PackBuilder);
}
