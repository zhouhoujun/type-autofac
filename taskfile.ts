import { TaskContainer } from '@taskfr/core';
import { INodeActivityContext, Asset, BuildModule, AssetActivity, ShellModule, TransformModule } from '@taskfr/build';
const jeditor = require('gulp-json-editor');
const jsonFormat = require('gulp-json-format');


let versionSetting = (ctx: INodeActivityContext) => {
    let envArgs = ctx.getEnvArgs();
    return jeditor((json: any) => {
        let version = envArgs['setvs'] || '';
        if (version) {
            json.version = version;
            if (json.peerDependencies) {
                Object.keys(json.peerDependencies).forEach(key => {
                    if (/^@ts-ioc/.test(key)) {
                        json.peerDependencies[key] = '^' + version;
                    }
                })
            }
        }
        return json;
    })
}

@Asset({
    pipes: [
        {
            src: ['packages/**/package.json', '!node_modules/**/package.json'],
            pipes: [
                (act: AssetActivity) => versionSetting(act.context),
                act => jsonFormat
            ],
            dest: 'packages',
            activity: AssetActivity
        },
        {
            src: ['package.json'],
            pipes: [
                (act: AssetActivity) => versionSetting(act.context)
            ],
            dest: '.',
            activity: AssetActivity
        },
        {
            shell: (ctx: INodeActivityContext) => {
                let envArgs = ctx.getEnvArgs();
                let packages = ctx.getFolders('packages').filter(f => !/activities/.test(f)); // (f => !/(annotations|aop|bootstrap)/.test(f));
                let cmd = envArgs.deploy ? 'npm publish --access=public' : 'npm run build';
                let cmds = packages.map(fd => {
                    return `cd ${fd} && ${cmd}`;
                });
                console.log(cmds);
                return cmds;
            },
            activity: 'shell'
        }
    ]
})
export class BuilderIoc {
}

TaskContainer.create(__dirname)
    .use(BuildModule, ShellModule, TransformModule)
    .bootstrap(BuilderIoc);
