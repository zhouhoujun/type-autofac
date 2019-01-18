import { Token, lang, isClass, hasOwnClassMetadata, Type, Abstract } from '@ts-ioc/core';
import { ISuiteDescribe, ICaseDescribe } from './ITestReport';


/**
 * reportor.
 *
 * @export
 * @abstract
 * @class Reporter
 */
@Abstract()
export abstract class Reporter {
    constructor() {

    }

    abstract render(suites: Map<Token<any>, ISuiteDescribe>): Promise<void>;
}

/**
 * realtime reporter.
 *
 * @export
 * @abstract
 * @class RealtimeReporter
 */
@Abstract()
export abstract class RealtimeReporter extends Reporter {
    constructor() {
        super();
    }
    /**
     * render suite.
     *
     * @abstract
     * @param {ISuiteDescribe} desc
     * @memberof RealtimeReporter
     */
    abstract renderSuite(desc: ISuiteDescribe): void;
    /**
     * render case.
     *
     * @abstract
     * @param {ICaseDescribe} desc
     * @memberof RealtimeReporter
     */
    abstract renderCase(desc: ICaseDescribe): void;
}

/**
 * is target reporter.
 *
 * @export
 * @param {*} target
 * @returns
 */
export function isReporterClass(target: any): target is Type<Reporter> {
    return isClass(target) && lang.isExtendsClass(target, Reporter);
}
