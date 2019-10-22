import { isString } from '@tsdi/ioc';
import { Input } from '@tsdi/components';
import { Task } from '@tsdi/activities';
import { NodeActivityContext, NodeExpression } from '../core';
import { PipeActivity } from './PipeActivity';


export abstract class SourcemapActivity extends PipeActivity {

    @Input() protected sourcemap: NodeExpression<string | boolean>;
    @Input('sourceMapFramework') framework: any;

    getFramework() {
        if (!this.framework) {
            this.framework = require('gulp-sourcemaps');
            if (!this.framework) {
                console.error('not found gulp-sourcemaps');
                return;
            }
        }
        return this.framework;
    }
}

@Task('[sourcemapInit]')
export class SourcemapInitActivity extends SourcemapActivity {

    protected async execute(ctx: NodeActivityContext): Promise<void> {
        let sourcemap = await this.resolveExpression(this.sourcemap, ctx);
        if (sourcemap) {
            let framework = this.getFramework();
            this.result.value = await this.executePipe(ctx, this.result.value, framework.init());
        }
    }
}


@Task('[sourcemapWrite]')
export class SourcemapWriteActivity extends SourcemapActivity {

    protected async execute(ctx: NodeActivityContext): Promise<void> {
        let sourcemap = await this.resolveExpression(this.sourcemap, ctx);
        if (sourcemap) {
            let framework = this.getFramework();
            this.result.value = await this.executePipe(ctx, this.result.value, framework.write(isString(sourcemap) ? sourcemap : './sourcemaps'));
        }
    }
}
