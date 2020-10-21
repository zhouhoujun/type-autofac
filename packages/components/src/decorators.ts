import { Token, ClassType, Registration, createPropDecorator, PropertyMetadata, Type, isBoolean, isUndefined, createParamDecorator, createDecorator, InjectableMetadata } from '@tsdi/ioc';
import { AnnotationReflect } from '@tsdi/boot';
import { BindingMetadata, ComponentMetadata, DirectiveMetadata, HostBindingMetadata, HostListenerMetadata, PipeMetadata, QueryMetadata, VaildateMetadata } from './metadata';
import { PipeTransform } from './pipes/pipe';
import { ComponentReflect } from './reflect';



/**
 * Directive decorator
 *
 * @export
 * @interface IDirectiveDecorator
 */
export interface IDirectiveDecorator {
    /**
     * Component decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`ComponentLifecycle`]
     *
     * @Component
     *
     * @param {DirectiveMetadata} [metadata] metadata map.
     */
    (metadata?: DirectiveMetadata): ClassDecorator;

    /**
     * Component decorator, use to define class as Component element.
     *
     * @Task
     * @param {string} selector metadata selector.
     */
    (selector: string, option?: InjectableMetadata): ClassDecorator;
}

/**
 * Directive decorator, define for class. use to define the class as Directive.
 *
 * @Component
 */
export const Directive: IDirectiveDecorator = createDecorator<DirectiveMetadata>('Directive', {
    actionType: ['annoation', 'typeProviders'],
    props: (selector: string, option?: InjectableMetadata) => ({ selector, ...option }),
    classHandle: (ctx, next) => {
        const reflect = ctx.reflect as AnnotationReflect;
        reflect.annoType = 'directive';
        reflect.annoDecor = ctx.decor;
        reflect.annotation = ctx.matedata;
        return next();
    }
});



/**
 * Component decorator
 *
 * @export
 * @interface IComponentDecorator
 */
export interface IComponentDecorator {
    /**
     * Component decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`ComponentLifecycle`]
     *
     * @Component
     *
     * @param {ComponentMetadata} [metadata] metadata map.
     */
    (metadata: ComponentMetadata): ClassDecorator;

    /**
     * Component decorator, use to define class as Component element.
     *
     * @Task
     * @param {string} selector metadata selector.
     */
    (selector: string, template?: any, option?: InjectableMetadata): ClassDecorator;
}

/**
 * Component decorator, define for class. use to define the class as Component. it can setting provider to some token, singleton or not. it will execute  [`ComponentLifecycle`]
 *
 * @Component
 */
export const Component: IComponentDecorator = createDecorator<ComponentMetadata>('Component', {
    actionType: ['annoation', 'typeProviders'],
    props: (selector: string, template?: any, option?: InjectableMetadata) => ({ selector, template, ...option }),
    classHandle: (ctx, next) => {
        const reflect = ctx.reflect as AnnotationReflect;
        reflect.annoType = 'component';
        reflect.annoDecor = ctx.decor;
        reflect.annotation = ctx.matedata;
        return next();
    }
});


/**
 * @NonSerialize decorator define component property not need serialized.
 */
export const NonSerialize = createPropDecorator<PropertyMetadata>('NonSerialize', {
    propHandle: (ctx, next) => {
        const reflect = ctx.reflect as ComponentReflect;
        if (!reflect.nonSerialize) {
            reflect.nonSerialize = [];
        }
        reflect.nonSerialize.push(ctx.propertyKey);
        return next();
    }
});

/**
 * HostBinding decorator.
 *
 * @export
 * @interface HostBindingPropertyDecorator
 */
export interface HostBindingPropertyDecorator {
    /**
     * define HostBinding property decorator with binding property name.
     *
     * @param {string} bindingName binding property name
     */
    (eventName: string, args: []): PropertyDecorator;

    /**
     * define HostBinding property decorator with binding metadata.
     *
     * @param {string} bindingName binding property name
     */
    (metadata: HostBindingMetadata): PropertyDecorator;
}



/**
 * Type of the `Host` decorator / constructor function.
 *
 * @publicApi
 */
export interface HostDecorator {
    /**
     * Parameter decorator on a view-provider parameter of a class constructor
     * that tells the DI framework to resolve the view by checking injectors of child
     * elements, and stop when reaching the host element of the current component.
     *
     */
    (): any;
    new(): Host;
}

/**
 * Type of the Host metadata.
 *
 * @publicApi
 */
export interface Host { }

/**
 * Host decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Host: HostDecorator = createParamDecorator('Host');



/**
 * HostBinding decorator.
 *
 * @export
 * @interface HostBindingPropertyDecorator
 */
export interface HostBindingPropertyDecorator {
    /**
     * Decorator that marks a DOM property as a host-binding property and supplies configuration
     * metadata.
     * Components automatically checks host property bindings during change detection, and
     * if a binding changes it updates the host element of the directive.
     *
     * @param {string} [hostPropertyName] binding property name
     */
    (hostPropertyName?: string): PropertyDecorator;

    /**
     * define HostBinding property decorator with binding metadata.
     *
     * @param {string} bindingName binding property name
     */
    (metadata: HostBindingMetadata): PropertyDecorator;
}

/**
 * output property decorator.
 */
export const HostBinding: HostBindingPropertyDecorator = createPropDecorator<HostBindingMetadata>('HostBinding', {
    props: (hostPropertyName?: string) => ({ hostPropertyName })
});



/**
 * HostListener decorator.
 *
 * @export
 * @interface HostListenerPropertyDecorator
 */
export interface HostListenerPropertyDecorator {
    /**
     * Decorator that binds a DOM event to a host listener and supplies configuration metadata.
     * Components invokes the supplied handler method when the host element emits the specified event,
     * and updates the bound element with the result.
     *
     * @param {string} eventName binding property name
     */
    (eventName?: string, args?: string[]): PropertyDecorator;

    /**
     * define HostListener property decorator with binding metadata.
     *
     * @param {string} bindingName binding property name
     */
    (metadata: HostListenerMetadata): PropertyDecorator;
}

/**
 * output property decorator.
 */
export const HostListener: HostListenerPropertyDecorator = createPropDecorator<HostListenerMetadata>('HostListener', {
    props: (eventName?: string, args?: string[]) => ({ eventName, args })
});


/**
 * Input decorator.
 *
 * @export
 * @interface InputPropertyDecorator
 */
export interface InputPropertyDecorator {
    /**
     * define Input property decorator with binding property name.
     *
     * @param {string} [bindingPropertyName] binding property name
     */
    (bindingPropertyName?: string): PropertyDecorator;

    /**
     * define Input property decorator with binding property name and provider.
     *
     * @param {string} bindingPropertyName binding property name
     * @param {*} defaultVal default value.
     */
    (bindingPropertyName: string, defaultVal: any): PropertyDecorator;

    /**
     * define Input property decorator with binding metadata.
     *
     * @param {string} bindingName binding property name
     */
    (metadata: BindingMetadata): PropertyDecorator;

}

/**
 * Input decorator.
 */
export const Input: InputPropertyDecorator = createPropDecorator<BindingMetadata>('Input', {
    props: (bindingPropertyName: string, defaultValue?: any) => ({ bindingPropertyName, defaultValue })
});




/**
 * Output decorator.
 *
 * @export
 * @interface OutputPropertyDecorator
 */
export interface OutputPropertyDecorator {
    /**
     * define Output property decorator with binding property name.
     *
     * @param {string} [bindingPropertyName] binding property name
     */
    (bindingPropertyName?: string): PropertyDecorator;

    /**
     * define Output property decorator with binding metadata.
     *
     * @param {string} bindingName binding property name
     */
    (metadata: BindingMetadata): PropertyDecorator;
}

/**
 * output property decorator.
 */
export const Output: OutputPropertyDecorator = createPropDecorator<BindingMetadata>('Output', {
    props: (bindingPropertyName?: string) => ({ bindingPropertyName })
});



/**
 * pipe decorator.
 */
export type PipeDecorator = <TFunction extends Type<PipeTransform>>(target: TFunction) => TFunction | void;


/**
 * Pipe decorator.
 *
 * @export
 * @interface IInjectableDecorator
 */
export interface IPipeDecorator {

    /**
     * Pipe decorator, define the class as pipe.
     *
     * @Pipe
     * @param {string} name  pipe name.
     * @param {boolean} pure If Pipe is pure (its output depends only on its input.) defaut true.
     */
    (name: string, pure?: boolean): PipeDecorator;

    /**
     * Pipe decorator, define the class as pipe.
     *
     * @Pipe
     *
     * @param {PipeMetadata} [metadata] metadata map.
     */
    (metadata: PipeMetadata): PipeDecorator;
}

/**
 * Pipe decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`PipeLifecycle`]
 *
 * @Pipe
 */
export const Pipe: IPipeDecorator = createDecorator<PipeMetadata>('Pipe', {
    actionType: ['annoation', 'typeProviders'],
    classHandle: (ctx, next) => {
        const reflect = ctx.reflect as AnnotationReflect;
        reflect.annoType = 'pipe';
        reflect.annoDecor = ctx.decor;
        reflect.annotation = ctx.matedata;
        return next();
    },
    props: (name: string, pure?: boolean) => ({ name, pure }),
    appendProps: meta => {
        if (isUndefined(meta.pure)) {
            meta.pure = true;
        }
    }
});

export abstract class Query { }

/**
 * Type of the ContentChildren decorator / constructor function.
 *
 * @see `ContentChildren`.
 * @publicApi
 */
export interface ContentChildrenDecorator {
    /**
     * Parameter decorator that configures a content query.
     *
     * Use to get the `QueryList` of elements or directives from the content DOM.
     * Any time a child element is added, removed, or moved, the query list will be
     * updated, and the changes observable of the query list will emit a new value.
     *
     * Content queries are set before the `ngAfterContentInit` callback is called.
     *
     * Does not retrieve elements or directives that are in other components' templates,
     * since a component's template is always a black box to its ancestors.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **descendants** - True to include all descendants, otherwise include only direct children.
     * * **read** - Used to read a different token from the queried elements.
     *
     * @usageNotes
     *
     * Here is a simple demonstration of how the `ContentChildren` decorator can be used.
     *
     * {@example core/di/ts/contentChildren/content_children_howto.ts region='HowTo'}
     *
     * ### Tab-pane example
     *
     * Here is a slightly more realistic example that shows how `ContentChildren` decorators
     * can be used to implement a tab pane component.
     *
     * {@example core/di/ts/contentChildren/content_children_example.ts region='Component'}
     *
     * @Annotation
     */
    (selector: Token | Function,
        opts?: { descendants?: boolean, read?: any }): any;
    new(selector: Token | Function,
        opts?: { descendants?: boolean, read?: any }): Query;
}

/**
 * ContentChildren decorator and metadata.
 *
 *
 * @Annotation
 * @publicApi
 */
export const ContentChildren: ContentChildrenDecorator = createPropDecorator(
    'ContentChildren', {
    props: (selector?: any, data?: { descendants?: boolean, read?: any }) =>
        ({ selector, first: false, isViewQuery: false, descendants: false, ...data })
});


/**
 * Type of the ContentChild decorator / constructor function.
 *
 * @publicApi
 */
export interface ContentChildDecorator {
    /**
     * Parameter decorator that configures a content query.
     *
     * Use to get the first element or the directive matching the selector from the content DOM.
     * If the content DOM changes, and a new child matches the selector,
     * the property will be updated.
     *
     * Content queries are set before the `ngAfterContentInit` callback is called.
     *
     * Does not retrieve elements or directives that are in other components' templates,
     * since a component's template is always a black box to its ancestors.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **read** - Used to read a different token from the queried element.
     * * **static** - True to resolve query results before change detection runs,
     * false to resolve after change detection. Defaults to false.
     *
     *
     * @Annotation
     */
    (selector: Token | Function,
        opts?: { read?: any, static?: boolean }): any;
    new(selector: Token | Function,
        opts?: { read?: any, static?: boolean }): Query;
}

/**
 * ContentChild decorator and metadata.
 *
 *
 * @Annotation
 *
 * @publicApi
 */
export const ContentChild: ContentChildDecorator = createPropDecorator('ContentChild', {
    props: (selector?: any, opts?: { read?: any, static?: boolean }) =>
        ({ selector, first: true, isViewQuery: false, descendants: true, ...opts })
});

/**
 * Type of the ViewChildren decorator / constructor function.
 *
 * @see `ViewChildren`.
 *
 * @publicApi
 */
export interface ViewChildrenDecorator {
    /**
     * Parameter decorator that configures a view query.
     *
     * Use to get the `QueryList` of elements or directives from the view DOM.
     * Any time a child element is added, removed, or moved, the query list will be updated,
     * and the changes observable of the query list will emit a new value.
     *
     * View queries are set before the `afterViewInit` callback is called.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **read** - Used to read a different token from the queried elements.
     *
     *
     * @Annotation
     */
    (selector: Token | Function, opts?: { read?: any }): PropertyDecorator;

    (metadata: QueryMetadata): PipeDecorator;
}

export const ViewChildren: ViewChildrenDecorator = createPropDecorator('ViewChildren', {
    props: (selector: Token | Function, opts?: { read?: any }) =>
        ({ selector, first: false, isViewQuery: true, descendants: true, ...opts })
});


/**
 * Type of the ViewChild decorator / constructor function.
 *
 * @see `ViewChild`.
 * @publicApi
 */
export interface ViewChildDecorator {
    /**
     * @description
     * Property decorator that configures a view query.
     * The change detector looks for the first element or the directive matching the selector
     * in the view DOM. If the view DOM changes, and a new child matches the selector,
     * the property is updated.
     *
     * View queries are set before the `ngAfterViewInit` callback is called.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **read** - Used to read a different token from the queried elements.
     * * **static** - True to resolve query results before change detection runs,
     * false to resolve after change detection. Defaults to false.
     *
     *
     * The following selectors are supported.
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
     * with `@ViewChild('cmp')`)
     *   * Any provider defined in the child component tree of the current component (e.g.
     * `@ViewChild(SomeService) someService: SomeService`)
     *   * Any provider defined through a string token (e.g. `@ViewChild('someToken') someTokenVal:
     * any`)
     *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with `@ViewChild(TemplateRef)
     * template;`)
     *
     *
     * @Annotation
     */
    (selector: Token | Function,
        opts?: { read?: any, static?: boolean }): any;
    new(selector: Token | Function,
        opts?: { read?: any, static?: boolean }): Query;
}

/**
 * ViewChild decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const ViewChild: ViewChildDecorator = createPropDecorator('ViewChild', {
    props: (selector: any, data: any) =>
        ({ selector, first: true, isViewQuery: true, descendants: true, ...data }),
});

/**
 * RefChild decorator, define for class. use to define the class. it can setting provider to some token, singleton or not. it will execute  [`RefChildLifecycle`]
 *
 * @RefChild
 */
export const RefChild = ViewChild;


/**
 * Vaildate decorator.
 *
 * @export
 * @interface VaildatePropertyDecorator
 */
export interface VaildatePropertyDecorator {
    /**
     * define Vaildate property is required or not.
     *
     * @param {boolean} required property is required or not.
     * @param {string} message error message of required.
     */
    (required: boolean, message?: string): PropertyDecorator;
    /**
     * define Vaildate property decorator.
     *
     * @param {((value: any, target?: any) => boolean | Promise<boolean>)} vaild vaild func for property.
     * @param {string} message error message of required.
     */
    (vaild: (value: any, target?: any) => boolean | Promise<boolean>, message?: string): PropertyDecorator;
    /**
     * define Vaildate property decorator with metadata.
     *
     * @param {string} bindingName binding property name
     */
    (metadata: VaildateMetadata): PropertyDecorator;
}

/**
 * Vaildate decorator.
 */
export const Vaildate: VaildatePropertyDecorator = createPropDecorator<VaildateMetadata>('Vaildate', {
    props: (vaild: any, errorMsg?: string) => {
        if (isBoolean(vaild)) {
            return { required: vaild, errorMsg };
        } else {
            return { vaild, errorMsg };
        }
    }
}) as VaildatePropertyDecorator;
