import { InjectableMetadata, ParamPropMetadata, TypeMetadata, ProviderMetadata, PropertyMetadata } from '@tsdi/ioc';
import { BindingTypes, BindingDirection } from './bindings/IBinding';

/**
 * component metadata.
 *
 * @export
 * @interface IComponentMetadata
 * @extends {InjectableMetadata}
 */
export interface DirectiveMetadata extends InjectableMetadata {
    /**
     * decotactor selector.
     *
     * @type {string}
     * @memberof IComponentMetadata
     */
    selector?: string;
}


/**
 * component metadata.
 *
 * @export
 * @interface ComponentMetadata
 * @extends {DirectiveMetadata}
 */
export interface ComponentMetadata extends DirectiveMetadata {
    /**
     * component selector.
     *
     * @type {string}
     * @memberof IComponentMetadata
     */
    selector?: string;
    /**
     * template for component.
     *
     * @type {*}
     * @memberof IComponentMetadata
     */
    template?: any;
}


/**
 * binding property metadata.
 *
 * @export
 * @interface BindingMetadata
 * @extends {ParamPropMetadata}
 */
export interface BindingMetadata extends ParamPropMetadata {
    /**
     * binding name.
     *
     * @type {string}
     * @memberof BindingMetadata
     */
    bindingName?: string;
    /**
     * default value.
     *
     * @type {*}
     * @memberof BindingMetadata
     */
    defaultValue?: any;
    /**
     * binding types.
     *
     * @type {BindingTypes}
     * @memberof BindingMetadata
     */
    bindingType?: BindingTypes;

    /**
     * binding direction.
     *
     * @type {BindingDirections}
     * @memberof IBinding
     */
    direction?: BindingDirection;
}



/**
 * HostBinding metadata.
 *
 */
export interface HostBindingMetadata extends ParamPropMetadata {
    /**
     * host property name.
     *
     * @type {string}
     * @memberof BindingPropertyMetadata
     */
    hostPropertyName?: string;
}


/**
 * HostListener metadata.
 *
 */
export interface HostListenerMetadata extends ParamPropMetadata {
    /**
     * event name.
     *
     * @type {string}
     * @memberof BindingPropertyMetadata
     */
    eventName?: string;
    /**
     * default value.
     *
     * @type {*}
     * @memberof BindingPropertyMetadata
     */
    args?: string[];
}


/**
 * pipe metadata.
 *
 * @export
 * @interface PipeMetadata
 * @extends {TypeMetadata}
 */
export interface PipeMetadata extends TypeMetadata, ProviderMetadata {
    /**
     * name of pipe.
     */
    name: string;
    /**
     * If Pipe is pure (its output depends only on its input.)
     */
    pure?: boolean;
}

/**
 * vaildate property metadata.
 */
export interface VaildateMetadata extends PropertyMetadata {
    required?: boolean;
    vaild?: (value: any, target?: any) => boolean | Promise<boolean>;
    errorMsg?: string;
}
