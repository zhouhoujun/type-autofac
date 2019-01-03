import { Inject, Injectable, isArray } from '@ts-ioc/core';
import { InputDataToken, InjectActivityContextToken } from '@taskfr/core';
import { BuildActivity } from './BuildActivity';
import { NodeActivityContext } from './NodeActivity';

/**
 * build activity context.
 */
export const BuidActivityContextToken = new InjectActivityContextToken(BuildActivity);

/**
 * build activity context.
 *
 * @export
 * @class BuidActivityContext
 * @extends {NodeActivityContext}
 */
@Injectable(BuidActivityContextToken)
export class BuidActivityContext extends NodeActivityContext<string[]> {

    constructor(@Inject(InputDataToken) input: any) {
        super(input);
    }

    /**
     * is completed or not.
     *
     * @returns {boolean}
     * @memberof BuidActivityContext
     */
    isCompleted(): boolean {
        return !this.result || this.result.length < 1;
    }

    protected translate(data: any): any {
        let re = super.translate(data);
        return isArray(re) ? re : [re];
    }

    /**
     * set complete files.
     *
     * @param {string[]} files
     * @memberof BuidActivityContext
     */
    complete(files: string[]) {
        this.result = this.result.filter(f => files.indexOf(f) < 0);
    }

}
