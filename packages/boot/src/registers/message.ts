import { DesignContext, isClass, lang } from '@tsdi/ioc';
import { IMessageQueue } from '../messages/IMessageQueue';
import { MessageMetadata } from '../decorators';
import { RootMessageQueueToken } from '../tk';


export const MessageRegisterAction = function (ctx: DesignContext, next: () => void): void {
    const classType = ctx.type;
    let metas = ctx.reflects.getMetadata<MessageMetadata>(ctx.currDecor, classType);
    const { parent: regIn, before, after } = metas[0] || <MessageMetadata>{};
    if (!regIn || regIn === 'none') {
        return next();
    }
    const injector = ctx.injector;
    let msgQueue: IMessageQueue;
    if (isClass(regIn)) {
        msgQueue = ctx.reflects.get(regIn)?.getInjector()?.get(regIn);
    } else {
        msgQueue = injector.getInstance(RootMessageQueueToken);
    }

    if (!msgQueue) {
        throw new Error(lang.getClassName(regIn) + 'has not registered!')
    }

    if (before) {
        msgQueue.useBefore(classType, before);
    } else if (after) {
        msgQueue.useAfter(classType, after);
    } else {
        msgQueue.use(classType);
    }
    next();
};
