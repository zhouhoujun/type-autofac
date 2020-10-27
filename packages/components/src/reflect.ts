import { Type } from '@tsdi/ioc';
import { AnnotationReflect } from '@tsdi/boot';
import { ComponentMetadata, DirectiveMetadata } from './metadata';


export interface DirectiveDef {
    expression: any;
    type: Type;
}

/**
 * directive reflect data.
 *
 * @export
 * @interface IBindingTypeReflect
 * @extends {ITypeReflect}
 */
export interface DirectiveReflect extends AnnotationReflect {

    /**
     * directive selector.
     */
    selector?: string;

    /**
     * annoation metadata.
     */
    annotation?: DirectiveMetadata;
}



/**
 * component def.
 */
export interface ComponentDef {
    expression: any;
    type: Type;
}



/**
 * component reflect data.
 *
 * @export
 * @interface IBindingTypeReflect
 * @extends {ITypeReflect}
 */
export interface ComponentReflect extends AnnotationReflect {
    /**
     * component selector.
     */
    selector?: string;
    /**
     * component annoation metadata.
     */
    annotation?: ComponentMetadata;

    directives?: any[];
    pipes?: any[];

    inputs?: any[];
    outputs?: any[];

    /**
     * none serializes.
     */
    nonSerialize?: string[];

}
