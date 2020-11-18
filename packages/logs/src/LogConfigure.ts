import { Token, ObjectMap } from '@tsdi/ioc';
import { ILoggerManager } from './ILoggerManager';
import { LOGFormater } from './formater';

/**
 * log configure. config logger format, looger adapter.
 *
 * @export
 * @interface LogConfigure
 */
export interface LogConfigure {
    /**
     * log adapter
     *
     * @type {Token<ILoggerManager>)}
     */
    adapter: Token<ILoggerManager>,

    /**
     * logger config options.
     *
     * @type {ObjectMap}
     */
    config?: ObjectMap;

    /**
     * format
     */
    format?: LOGFormater;
}
