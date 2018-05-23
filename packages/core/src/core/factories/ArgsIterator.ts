import { Metadate } from '../metadatas/index';
import { lang, isMetadataObject } from '../../utils/index';


export interface CheckExpress<T extends Metadate> {
    match(arg: any): boolean;
    isMetadata?(arg: any): boolean;
    setMetadata(metadata: T, arg: any): void
}

export class ArgsIterator {
    private idx: number;
    private metadata: Metadate;
    constructor(protected args: any[]) {
        this.idx = -1;
        this.metadata = null;
    }

    isCompeted(): boolean {
        return this.idx >= this.args.length;
    }

    end() {
        this.idx = this.args.length;
    }

    next<T>(express: CheckExpress<T>) {
        this.idx++;
        if (this.isCompeted()) {
            return null;
        }

        let arg = this.args[this.idx];
        if ((express.isMetadata && express.isMetadata(arg)) || isMetadataObject(arg)) {
            this.metadata = lang.assign(this.metadata || {}, arg);
            this.end();
        } else if (express.match(arg)) {
            this.metadata = this.metadata || {};
            express.setMetadata(this.metadata as T, arg);
        } else {
            this.end();
        }
    }

    getArgs() {
        return this.args;
    }

    getMetadata() {
        return this.metadata;
    }
}

