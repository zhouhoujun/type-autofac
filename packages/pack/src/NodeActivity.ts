import { Activity } from '@tsdi/activities';
import { NodeActivityContext } from './NodeActivityContext';

/**
 * activity for server side.
 *
 * @export
 * @abstract
 * @class NodeActivity
 * @extends {Activity<T>}
 * @template T
 */
export abstract class NodeActivity<T, TCtx extends NodeActivityContext = NodeActivityContext> extends Activity<T, TCtx> {

}
