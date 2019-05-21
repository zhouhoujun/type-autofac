import { Src, Task, TemplateOption, ActivityType, GActivityType } from '@tsdi/activities';
import { NodeActivityContext, ITransform, NodeExpression } from '../core';
import { StreamActivity } from './StreamActivity';
import { SourceActivity } from './SourceActivity';
import { DestActivity } from './DestActivity';
import { Input, Binding } from '@tsdi/boot';
import { CleanActivity } from '../tasks';
import { PipeActivity } from './PipeActivity';

import { SourcemapInitActivity, SourcemapWriteActivity } from './SourceMap';

/**
 * shell activity config.
 *
 * @export
 * @interface AssetActivityOption
 * @extends {ActivityConfigure}
 */
export interface AssetActivityOption extends TemplateOption {
    clean?: Binding<NodeExpression<Src>>;
    /**
     * shell cmd
     *
     * @type {Binding<Src>}
     * @memberof AssetActivityOption
     */
    src?: Binding<NodeExpression<Src>>;

    sourcemap?: Binding<NodeExpression<string | boolean>>;
    /**
     * shell args.
     *
     * @type {Binding<Src>}
     * @memberof AssetActivityOption
     */
    dist?: Binding<NodeExpression<Src>>;

    /**
     *
     *
     * @type {Binding<NodeExpression<ITransform>[]>}
     * @memberof ShellActivityOption
     */
    pipes?: Binding<GActivityType<ITransform>[]>;

}


/**
 * Shell Task
 *
 * @class ShellActivity
 * @implements {ITask}
 */
@Task('asset')
export class AssetActivity extends PipeActivity {

    @Input()
    clean: CleanActivity;
    /**
     * assert src.
     *
     * @type {NodeExpression<Src>}
     * @memberof AssetActivity
     */
    @Input()
    src: SourceActivity;
    /**
     * shell args.
     *
     * @type {NodeExpression<Src>}
     * @memberof AssetActivity
     */
    @Input('dist')
    dist: DestActivity;

    @Input('sourcemap')
    sourcemapInit: SourcemapInitActivity;

    @Input('sourcemap')
    sourcemapWrite: SourcemapWriteActivity;

    @Input('pipes')
    streamPipes: StreamActivity;

    protected async execute(ctx: NodeActivityContext): Promise<void> {
        await this.runActivity(ctx, this.getRunSequence());
    }

    protected getRunSequence(): ActivityType[] {
        return [
            this.clean,
            this.src,
            this.sourcemapInit,
            this.streamPipes,
            this.sourcemapWrite,
            this.dist
        ]
    }

}
