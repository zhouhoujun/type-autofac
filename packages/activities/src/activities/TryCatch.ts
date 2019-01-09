import { Task } from '../decorators/Task';
import { InjectAcitityToken, TryCatchConfigure } from '../core';
import { ChainActivity } from './ChainActivity';

/**
 * while activity token.
 */
export const TryCatchActivityToken = new InjectAcitityToken<TryCatchActivity>('trycatch');

/**
 * while control activity.
 *
 * @export
 * @class TryCatchActivity
 * @extends {ControlActivity}
 */
@Task(TryCatchActivityToken, 'try')
export class TryCatchActivity extends ChainActivity {

    protected async execute(): Promise<void> {
        let config = this.context.config as TryCatchConfigure;
        try {
            await this.execActivity(config.try, this.context);
        } catch (err) {
            let ctx = this.createContext(err);
            await this.handleRequest(ctx, (config.catchs || []).concat(this.handles || []));
        } finally {
            await this.execActivity(config.finally, this.context);
        }
    }
}
