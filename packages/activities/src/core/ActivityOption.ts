import { IBuildOption } from '@tsdi/boot';
import { ActivityTemplate } from './ActivityMetadata';


/**
 * activity option.
 *
 * @export
 * @interface ActivityOption
 * @extends {BootOption}
 */
export interface ActivityOption<T = any> extends IBuildOption<T> {
    /**
     * name.
     */
    name?: string;
    /**
     * activities component template scope.
     *
     * @type {ActivityTemplate}
     * @memberof ActivityConfigure
     */
    template?: ActivityTemplate;

    /**
     * input data
     */
    data?: any;
}
