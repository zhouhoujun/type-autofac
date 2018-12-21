import { CtxType, Expression, ExpressionType } from '@taskfr/core';
import { ITransform } from './ITransform';
import { ObjectMap, isObservable, isObject } from '@ts-ioc/core';
import { isFunction } from '@ts-ioc/core';
import { Stream } from 'stream';



/**
 * transform type.
 */
export type TransformType = Expression<ITransform>;

/**
 * transform config type.
 */
export type TransformConfig = ExpressionType<ITransform>;

/**
 * task transform express.
 */
export type TransformExpress = CtxType<TransformConfig[]>;

/**
 * transform dest express
 */
export type DestExpress = ObjectMap<TransformExpress> | TransformExpress;


/**
 *check target is transform or not.
 *
 * @export
 * @param {*} target
 * @returns {boolean}
 */
export function isTransform(target: any): boolean {
    return (isObject(target) === true) && (target instanceof Stream || (isFunction(target.pipe) && !isObservable(target)));
}
