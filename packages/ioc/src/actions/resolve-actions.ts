import { ResolveContext } from './ResolveContext';
import { isNullOrUndefined } from '../utils/lang';
import { CTX_DEFAULT_TOKEN, CTX_TARGET_TOKEN } from '../context-tokens';
import { InjectReference } from '../InjectReference';
import { PROVIDERS } from '../IInjector';

export const ResolveDefaultAction = function (ctx: ResolveContext, next: () => void): void {
    if (ctx.providers.has(ctx.token)) {
        ctx.instance = ctx.providers.get(ctx.token);
    }
    if (isNullOrUndefined(ctx.instance) && ctx.hasValue(CTX_DEFAULT_TOKEN)) {
        ctx.instance = ctx.injector.get(ctx.defaultToken, ctx.providers);
    }
    if (isNullOrUndefined(ctx.instance)) {
        next();
    }
};

export const ResolveInInjectorAction = function (ctx: ResolveContext, next: () => void): void {
    let injector = ctx.injector;
    if (injector.has(ctx.token)) {
        ctx.instance = injector.get(ctx.token, ctx.providers);
    }

    if (isNullOrUndefined(ctx.instance)) {
        next();
    }
};


export const ResolveInRootAction = function (ctx: ResolveContext, next: () => void): void {
    let container = ctx.getContainer();
    if (container.has(ctx.token)) {
        ctx.instance = container.get(ctx.token, ctx.providers);
    }
    if (isNullOrUndefined(ctx.instance)) {
        next();
    }
};

export const ResolvePrivateAction = function (ctx: ResolveContext, next: () => void): void {
    if (ctx.hasValue(CTX_TARGET_TOKEN)) {
        let tk = new InjectReference(PROVIDERS, ctx.getValue(CTX_TARGET_TOKEN));
        let privPdr = ctx.injector.get(tk);
        if (privPdr && privPdr.has(ctx.token)) {
            ctx.instance = privPdr.get(ctx.token, ctx.providers);
        }
    }
    if (isNullOrUndefined(ctx.instance)) {
        next();
    }
};


export const ResolveRefAction = function (ctx: ResolveContext, next: () => void): void {
    if (ctx.hasValue(CTX_TARGET_TOKEN)) {
        let tk = new InjectReference(ctx.token, ctx.getValue(CTX_TARGET_TOKEN));
        ctx.instance = ctx.injector.get(tk, ctx.providers);
    }
    if (isNullOrUndefined(ctx.instance) && !ctx.getOptions().tagOnly) {
        next();
    }
};