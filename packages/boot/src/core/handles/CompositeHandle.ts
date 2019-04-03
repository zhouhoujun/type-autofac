import { Handle, HandleType, IHandleContext } from './Handle';
import { PromiseUtil } from '@tsdi/ioc';


/**
 * composite handles.
 *
 * @export
 * @class CompositeHandle
 * @extends {Handle<T>}
 * @template T
 */
export class CompositeHandle<T extends IHandleContext> extends Handle<T> {

    protected handles: HandleType<T>[];
    private funcs: PromiseUtil.ActionHandle<T>[];

    onInit() {
        this.handles = [];
    }

    /**
     * use handle.
     *
     * @param {HandleType} handle
     * @param {boolean} [first]  use action at first or last.
     * @returns {this}
     * @memberof LifeScope
     */
    use(handle: HandleType<T>, first?: boolean): this {
        if (first) {
            this.handles.unshift(handle);
        } else {
            this.handles.push(handle);
        }
        this.resetFuncs();
        return this;
    }

    /**
     * use handle before
     *
     * @param {HandleType} handle
     * @param {HandleType} before
     * @returns {this}
     * @memberof LifeScope
     */
    useBefore(handle: HandleType<T>, before: HandleType<T>): this {
        this.handles.splice(this.handles.indexOf(before) - 1, 0, handle);
        this.resetFuncs();
        return this;
    }
    /**
     * use handle after.
     *
     * @param {HandleType} handle
     * @param {HandleType} after
     * @returns {this}
     * @memberof LifeScope
     */
    useAfter(handle: HandleType<T>, after: HandleType<T>): this {
        this.handles.splice(this.handles.indexOf(after), 0, handle);
        this.resetFuncs();
        return this;
    }

    async execute(ctx: T, next?: () => Promise<void>): Promise<void> {
        if (!this.funcs) {
            this.funcs = this.handles.map(ac => this.toFunc(ac))
        }
        await this.execActions(ctx, this.funcs, next);
    }

    protected resetFuncs() {
        this.funcs = null;
    }
}
