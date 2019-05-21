import { Task, TemplateOption } from '@tsdi/activities';
import { NodeActivityContext } from '../core';
import * as through from 'through2';
import { Input, Binding } from '@tsdi/boot';
import { isFunction, ObjectMap, lang } from '@tsdi/ioc';
import { TransformActivity } from './TransformActivity';
const jeditor = require('gulp-json-editor');
const inplace = require('json-in-place');


export type JsonEdit = (json: any, ctx?: NodeActivityContext) => ObjectMap<any>;


export interface JsonEditActivityOption extends TemplateOption {
    /**
     * edite fields.
     *
     * @type {Binding<JsonEdit>}
     * @memberof SourceActivityOption
     */
    json: Binding<JsonEdit | ObjectMap<any>>;
}

/**
 * edit json, will format new json string.
 *
 * @export
 * @class JsonEditActivity
 * @extends {TransformActivity}
 */
@Task('jsonEdit')
export class JsonEditActivity extends TransformActivity {

    @Input()
    json: JsonEdit | ObjectMap<any>;

    protected async execute(ctx: NodeActivityContext): Promise<void> {
        if (!this.json) {
            return;
        }
        if (isFunction(this.json)) {
            let jsonFunc = this.json;
            this.result.value = jeditor((json) => jsonFunc(json, ctx));
        } else {
            this.result.value = jeditor(this.json);
        }
    }

}


export interface JsonReplaceActivityOption extends TemplateOption {
    /**
     * edite fields.
     *
     * @type {Binding<JsonEdit>}
     * @memberof SourceActivityOption
     */
    fields: Binding<JsonEdit>;
}

/**
 * replace json value of key. no format.
 *
 * @export
 * @class JsonReplaceActivity
 * @extends {TransformActivity}
 */
@Task('jsonReplace')
export class JsonReplaceActivity extends TransformActivity {

    @Input()
    fields: JsonEdit;

    protected async execute(ctx: NodeActivityContext): Promise<void> {
        let fields = this.fields;
        if (!isFunction(fields)) {
            return;
        }
        this.result.value = through.obj(function (file, encoding, callback) {
            if (file.isNull()) {
                return callback(null, file);
            }

            if (file.isStream()) {
                return callback('doesn\'t support Streams');
            }

            let contents: string = file.contents.toString('utf8');
            let json = JSON.parse(contents);
            let replaced = inplace(contents);
            lang.forIn(fields(json, ctx), (val, key) => {
                replaced.set(key, val);
            });
            contents = replaced.toString();
            file.contents = new Buffer(contents);
            this.push(file);
            callback();
        });
    }
}

