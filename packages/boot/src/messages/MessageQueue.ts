import { isClass, Injectable, isString, ProviderTypes, isFunction, Token, isUndefined, INJECTOR, Inject, PromiseUtil, isToken, Action } from '@tsdi/ioc';
import { ICoreInjector } from '@tsdi/core';
import { MessageContext, MessageOption } from './MessageContext';
import { IMessageQueue } from './IMessageQueue';
import { HandleType, IHandle } from '../handles/Handle';
import { Handles } from '../handles/Handles';



/**
 * composite message.
 *
 * @export
 * @abstract
 * @class MessageQueue
 * @extends {Handles<T>}
 * @template T
 */
@Injectable
export class MessageQueue<T extends MessageContext = MessageContext> extends Handles<T> implements IMessageQueue<T> {


    @Inject(INJECTOR)
    injector: ICoreInjector;

    private completed: ((ctx: T) => void)[];

    async execute(ctx: T, next?: () => Promise<void>): Promise<void> {
        await super.execute(ctx, next);
        this.completed && this.completed.map(cb => {
            cb(ctx);
        });
    }

    /**
     * register completed callbacks.
     * @param callback callback.T
     */
    done(callback: (ctx: T) => void) {
        if (this.completed) {
            this.completed = [];
        }
        this.completed.push(callback);
    }

    /**
     * send message
     *
     * @param {T} ctx message context
     * @param {() => Promise<void>} [next]
     * @returns {Promise<void>}
     * @memberof IMessageQueue
     */
    send(ctx: T): Promise<void>;
    /**
     * send message
     *
     * @template TOpt
     * @param {TOpt} options
     * @param {() => T} [fac]
     * @returns {Promise<void>}
     * @memberof IMessageQueue
     */
    send<TOpt extends MessageOption>(options: TOpt, fac?: () => T): Promise<void>;
    /**
     * send message
     *
     * @param {string} event
     * @param {*} data
     * @returns {Promise<void>}
     * @memberof IMessageQueue
     */
    send(event: string, data: any, fac?: (...providers: ProviderTypes[]) => T): Promise<void>;
    /**
     * send message
     *
     * @param {string} event
     * @param {string} type
     * @param {*} data
     * @param {(...providers: ProviderTypes[]) => T} [fac]
     * @returns {Promise<void>}
     * @memberof IMessageQueue
     */
    send(event: string, type: string, data: any, fac?: (...providers: ProviderTypes[]) => T): Promise<void>;
    send(event: any, type?: any, data?: any, fac?: () => T): Promise<void> {
        if (event instanceof MessageContext) {
            return this.execute(event as T);
        } else {
            if (isFunction(type)) {
                fac = type;
                type = undefined;
            } else if (isFunction(data)) {
                fac = data;
                data = undefined;
            }
            let ctx = fac ? fac() : this.injector.resolve(MessageContext) as T;
            if (isString(event)) {
                if (!isString(type)) {
                    data = type;
                    type = undefined;
                } else if (isString(type) && isUndefined(data)) {
                    data = type;
                    type = undefined;
                }
                ctx.setOptions({
                    event: event,
                    type: type,
                    data: data
                });
            } else {
                ctx.setOptions(event);
            }
            return this.execute(ctx);
        }
    }

    /**
     * subescribe message.
     *
     * @param {(ctx: T, next: () => Promise<void>) => Promise<void>} subscriber
     * @memberof IMessageQueue
     */
    subscribe(subscriber: (ctx: T, next: () => Promise<void>) => Promise<void>);
    /**
     * subscribe message by handle instance;
     *
     * @param {IHandle} handle
     * @memberof IMessageQueue
     */
    subscribe(handle: IHandle);
    /**
     * subscribe message by handle type or token.
     *
     * @param {IHandle} handle
     * @memberof IMessageQueue
     */
    subscribe(handle: Token<IHandle>);
    subscribe(haddle: HandleType<T>) {
        this.use(haddle);
    }

    /**
     * subescribe message.
     *
     * @param {(ctx: T, next: () => Promise<void>) => Promise<void>} subscriber
     * @memberof IMessageQueue
     */
    unsubscribe(subscriber: (ctx: T, next: () => Promise<void>) => Promise<void>);
    /**
     * subscribe message by handle instance;
     *
     * @param {IHandle} handle
     * @memberof IMessageQueue
     */
    unsubscribe(handle: IHandle);
    /**
     * subscribe message by handle type or token.
     *
     * @param {IHandle} handle
     * @memberof IMessageQueue
     */
    unsubscribe(handle: Token<IHandle>);
    unsubscribe(haddle: HandleType<T>) {
        this.unuse(haddle);
    }

    protected registerHandle(HandleType: HandleType<T>): this {
        if (isClass(HandleType)) {
            this.injector.registerType(HandleType);
        }
        return this;
    }

    protected toHandle(handleType: HandleType<T>): PromiseUtil.ActionHandle<T> {
        if (handleType instanceof Action) {
            return handleType.toAction() as PromiseUtil.ActionHandle<T>;
        } else if (isToken(handleType)) {
            return this.injector.get<Action>(handleType)?.toAction?.() as PromiseUtil.ActionHandle<T>;
        } else if (isFunction(handleType)) {
            return handleType as PromiseUtil.ActionHandle<T>;
        }
        return null;
    }
}
