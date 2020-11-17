import { IInjector, Token } from '@tsdi/ioc';
import { LContainer } from './container';
import { ComponentDef, ComponentTemplate, DirectiveDef, DirectiveDefList, HostBindingsFunction, PipeDef, PipeDefList, SchemaMetadata, ViewQueriesFunction } from './definition';
import { TConstants, TNode } from './node';
import { PlayerHandler } from './player';
import { LQueries, TQueries } from './query';
import { TStylingKey, TStylingRange } from './styling';
import { RElement, Renderer, RendererFactory } from './renderer';




// Below are constants for LView indices to help us look up LView members
// without having to remember the specific indices.
// Uglify will inline these when minifying so there shouldn't be a cost.
export const HOST = 0;
export const TVIEW = 1;
export const FLAGS = 2;
export const PARENT = 3;
export const NEXT = 4;
export const TRANSPLANTED_VIEWS_TO_REFRESH = 5;
export const T_HOST = 6;
export const CLEANUP = 7;
export const CONTEXT = 8;
export const INJECTOR = 9;
export const RENDERER_FACTORY = 10;
export const RENDERER = 11;
export const SANITIZER = 12;
export const CHILD_HEAD = 13;
export const CHILD_TAIL = 14;
// FIXME(misko): Investigate if the three declarations aren't all same thing.
export const DECLARATION_VIEW = 15;
export const DECLARATION_COMPONENT_VIEW = 16;
export const DECLARATION_LCONTAINER = 17;
export const PREORDER_HOOK_FLAGS = 18;
export const QUERIES = 19;
/** Size of LView's header. Necessary to adjust for it when setting slots.  */
export const HEADER_OFFSET = 20;


/**
 * `LView` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `LView`. When processing a particular view, we set the `viewData` to that
 * `LView`. When that view is done processing, the `viewData` is set back to
 * whatever the original `viewData` was before (the parent `LView`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 */
export interface LView extends Array<any> {

  /**
   * The node into which this `LView` is inserted.
   */
  [HOST]: RElement | null;

  /**
   * The static data for this view. We need a reference to this so we can easily walk up the
   * node tree in DI and get the TView.data array associated with a node (where the
   * directive defs are stored).
   */
  readonly [TVIEW]: TView;

  /** Flags for this view. See LViewFlags for more info. */
  [FLAGS]: LViewFlags;

  /**
   * This may store an {@link LView} or {@link LContainer}.
   *
   * `LView` - The parent view. This is needed when we exit the view and must restore the previous
   * LView. Without this, the render method would have to keep a stack of
   * views as it is recursively rendering templates.
   *
   * `LContainer` - The current view is part of a container, and is an embedded view.
   */
  [PARENT]: LView | LContainer | null;

  /**
   *
   * The next sibling LView or LContainer.
   *
   * Allows us to propagate between sibling view states that aren't in the same
   * container. Embedded views already have a node.next, but it is only set for
   * views in the same container. We need a way to link component views and views
   * across containers as well.
   */
  [NEXT]: LView | LContainer | null;

  /** Queries active for this view - nodes from a view are reported to those queries. */
  [QUERIES]: LQueries | null;

  /**
   * Store the `TNode` of the location where the current `LView` is inserted into.
   *
   * Given:
   * ```
   * <div>
   *   <ng-template><span></span></ng-template>
   * </div>
   * ```
   *
   * We end up with two `TView`s.
   * - `parent` `TView` which contains `<div><!-- anchor --></div>`
   * - `child` `TView` which contains `<span></span>`
   *
   * Typically the `child` is inserted into the declaration location of the `parent`, but it can be
   * inserted anywhere. Because it can be inserted anywhere it is not possible to store the
   * insertion information in the `TView` and instead we must store it in the `LView[T_HOST]`.
   *
   * So to determine where is our insertion parent we would execute:
   * ```
   * const parentLView = lView[PARENT];
   * const parentTNode = lView[T_HOST];
   * const insertionParent = parentLView[parentTNode.index];
   * ```
   *
   *
   * If `null`, this is the root view of an application (root component is in this view) and it has
   * no parents.
   */
  [T_HOST]: TNode | null;

  /**
   * When a view is destroyed, listeners need to be released and outputs need to be
   * unsubscribed. This context array stores both listener functions wrapped with
   * their context and output subscription instances for a particular view.
   *
   * These change per LView instance, so they cannot be stored on TView. Instead,
   * TView.cleanup saves an index to the necessary context in this array.
   */
  // TODO: flatten into LView[]
  [CLEANUP]: any[] | null;

  /**
   * - For dynamic views, this is the context with which to render the template (e.g.
   *   `NgForContext`), or `{}` if not defined explicitly.
   * - For root view of the root component the context contains change detection data.
   * - For non-root components, the context is the component instance,
   * - For inline views, the context is null.
   */
  [CONTEXT]: {} | RootContext | null;

  /** An optional Module Injector to be used as fall back after Element Injectors are consulted. */
  readonly [INJECTOR]: IInjector | null;

  /** Factory to be used for creating Renderer. */
  [RENDERER_FACTORY]: RendererFactory;

  /** Renderer to be used for this view. */
  [RENDERER]: Renderer;

  /**
   * Reference to the first LView or LContainer beneath this LView in
   * the hierarchy.
   *
   * Necessary to store this so views can traverse through their nested views
   * to remove listeners and call onDestroy callbacks.
   */
  [CHILD_HEAD]: LView | LContainer | null;

  /**
   * The last LView or LContainer beneath this LView in the hierarchy.
   *
   * The tail allows us to quickly add a new state to the end of the view list
   * without having to propagate starting from the first child.
   */
  [CHILD_TAIL]: LView | LContainer | null;

  /**
   * View where this view's template was declared.
   *
   * The template for a dynamically created view may be declared in a different view than
   * it is inserted. We already track the "insertion view" (view where the template was
   * inserted) in LView[PARENT], but we also need access to the "declaration view"
   * (view where the template was declared). Otherwise, we wouldn't be able to call the
   * view's template function with the proper contexts. Context should be inherited from
   * the declaration view tree, not the insertion view tree.
   *
   * Example (AppComponent template):
   *
   * <ng-template #foo></ng-template>       <-- declared here -->
   * <some-comp [tpl]="foo"></some-comp>    <-- inserted inside this component -->
   *
   * The <ng-template> above is declared in the AppComponent template, but it will be passed into
   * SomeComp and inserted there. In this case, the declaration view would be the AppComponent,
   * but the insertion view would be SomeComp. When we are removing views, we would want to
   * traverse through the insertion view to clean up listeners. When we are calling the
   * template function during change detection, we need the declaration view to get inherited
   * context.
   */
  [DECLARATION_VIEW]: LView | null;


  /**
   * Points to the declaration component view, used to track transplanted `LView`s.
   *
   * See: `DECLARATION_VIEW` which points to the actual `LView` where it was declared, whereas
   * `DECLARATION_COMPONENT_VIEW` points to the component which may not be same as
   * `DECLARATION_VIEW`.
   *
   * Example:
   * ```
   * <#VIEW #myComp>
   *  <div *ngIf="true">
   *   <ng-template #myTmpl>...</ng-template>
   *  </div>
   * </#VIEW>
   * ```
   * In the above case `DECLARATION_VIEW` for `myTmpl` points to the `LView` of `ngIf` whereas
   * `DECLARATION_COMPONENT_VIEW` points to `LView` of the `myComp` which owns the template.
   *
   * The reason for this is that all embedded views are always check-always whereas the component
   * view can be check-always or on-push. When we have a transplanted view it is important to
   * determine if we have transplanted a view from check-always declaration to on-push insertion
   * point. In such a case the transplanted view needs to be added to the `LContainer` in the
   * declared `LView` and CD during the declared view CD (in addition to the CD at the insertion
   * point.) (Any transplanted views which are intra Component are of no interest because the CD
   * strategy of declaration and insertion will always be the same, because it is the same
   * component.)
   *
   * Queries already track moved views in `LView[DECLARATION_LCONTAINER]` and
   * `LContainer[MOVED_VIEWS]`. However the queries also track `LView`s which moved within the same
   * component `LView`. Transplanted views are a subset of moved views, and we use
   * `DECLARATION_COMPONENT_VIEW` to differentiate them. As in this example.
   *
   * Example showing intra component `LView` movement.
   * ```
   * <#VIEW #myComp>
   *   <div *ngIf="condition; then thenBlock else elseBlock"></div>
   *   <ng-template #thenBlock>Content to render when condition is true.</ng-template>
   *   <ng-template #elseBlock>Content to render when condition is false.</ng-template>
   * </#VIEW>
   * ```
   * The `thenBlock` and `elseBlock` is moved but not transplanted.
   *
   * Example showing inter component `LView` movement (transplanted view).
   * ```
   * <#VIEW #myComp>
   *   <ng-template #myTmpl>...</ng-template>
   *   <insertion-component [template]="myTmpl"></insertion-component>
   * </#VIEW>
   * ```
   * In the above example `myTmpl` is passed into a different component. If `insertion-component`
   * instantiates `myTmpl` and `insertion-component` is on-push then the `LContainer` needs to be
   * marked as containing transplanted views and those views need to be CD as part of the
   * declaration CD.
   *
   *
   * When change detection runs, it iterates over `[MOVED_VIEWS]` and CDs any child `LView`s where
   * the `DECLARATION_COMPONENT_VIEW` of the current component and the child `LView` does not match
   * (it has been transplanted across components.)
   *
   * Note: `[DECLARATION_COMPONENT_VIEW]` points to itself if the LView is a component view (the
   *       simplest / most common case).
   *
   * see also:
   *   - https://hackmd.io/@mhevery/rJUJsvv9H write up of the problem
   *   - `LContainer[HAS_TRANSPLANTED_VIEWS]` which marks which `LContainer` has transplanted views.
   *   - `LContainer[TRANSPLANT_HEAD]` and `LContainer[TRANSPLANT_TAIL]` storage for transplanted
   *   - `LView[DECLARATION_LCONTAINER]` similar problem for queries
   *   - `LContainer[MOVED_VIEWS]` similar problem for queries
   */
  [DECLARATION_COMPONENT_VIEW]: LView;

  /**
   * A declaration point of embedded views (ones instantiated based on the content of a
   * <ng-template>), null for other types of views.
   *
   * We need to track all embedded views created from a given declaration point so we can prepare
   * query matches in a proper order (query matches are ordered based on their declaration point and
   * _not_ the insertion point).
   */
  [DECLARATION_LCONTAINER]: LContainer | null;

  /**
   * More flags for this view. See PreOrderHookFlags for more info.
   */
  [PREORDER_HOOK_FLAGS]: PreOrderHookFlags;

  /**
   * The number of direct transplanted views which need a refresh or have descendants themselves
   * that need a refresh but have not marked their ancestors as Dirty. This tells us that during
   * change detection we should still descend to find those children to refresh, even if the parents
   * are not `Dirty`/`CheckAlways`.
   */
  [TRANSPLANTED_VIEWS_TO_REFRESH]: number;
}

/** Flags associated with an LView (saved in LView[FLAGS]) */
export const enum LViewFlags {
  /** The state of the init phase on the first 2 bits */
  InitPhaseStateIncrementer = 0b00000000001,
  InitPhaseStateMask = 0b00000000011,

  /**
   * Whether or not the view is in creationMode.
   *
   * This must be stored in the view rather than using `data` as a marker so that
   * we can properly support embedded views. Otherwise, when exiting a child view
   * back into the parent view, `data` will be defined and `creationMode` will be
   * improperly reported as false.
   */
  CreationMode = 0b00000000100,

  /**
   * Whether or not this LView instance is on its first processing pass.
   *
   * An LView instance is considered to be on its "first pass" until it
   * has completed one creation mode run and one update mode run. At this
   * time, the flag is turned off.
   */
  FirstLViewPass = 0b00000001000,

  /** Whether this view has default change detection strategy (checks always) or onPush */
  CheckAlways = 0b00000010000,

  /**
   * Whether or not manual change detection is turned on for onPush components.
   *
   * This is a special mode that only marks components dirty in two cases:
   * 1) There has been a change to an @Input property
   * 2) `markDirty()` has been called manually by the user
   *
   * Note that in this mode, the firing of events does NOT mark components
   * dirty automatically.
   *
   * Manual mode is turned off by default for backwards compatibility, as events
   * automatically mark OnPush components dirty in View Engine.
   *
   * TODO: Add a public API to ChangeDetectionStrategy to turn this mode on
   */
  ManualOnPush = 0b00000100000,

  /** Whether or not this view is currently dirty (needing check) */
  Dirty = 0b000001000000,

  /** Whether or not this view is currently attached to change detection tree. */
  Attached = 0b000010000000,

  /** Whether or not this view is destroyed. */
  Destroyed = 0b000100000000,

  /** Whether or not this view is the root view */
  IsRoot = 0b001000000000,

  /**
   * Whether this moved LView was needs to be refreshed at the insertion location because the
   * declaration was dirty.
   */
  RefreshTransplantedView = 0b0010000000000,

  /**
   * Index of the current init phase on last 21 bits
   */
  IndexWithinInitPhaseIncrementer = 0b0100000000000,
  IndexWithinInitPhaseShift = 11,
  IndexWithinInitPhaseReset = 0b0011111111111,
}

/**
 * Possible states of the init phase:
 * - 00: OnInit hooks to be run.
 * - 01: AfterContentInit hooks to be run
 * - 10: AfterViewInit hooks to be run
 * - 11: All init hooks have been run
 */
export const enum InitPhaseState {
  OnInitHooksToBeRun = 0b00,
  AfterContentInitHooksToBeRun = 0b01,
  AfterViewInitHooksToBeRun = 0b10,
  InitPhaseCompleted = 0b11,
}

/** More flags associated with an LView (saved in LView[PREORDER_HOOK_FLAGS]) */
export const enum PreOrderHookFlags {
  /**
     The index of the next pre-order hook to be called in the hooks array, on the first 16
     bits
   */
  IndexOfTheNextPreOrderHookMaskMask = 0b01111111111111111,

  /**
   * The number of init hooks that have already been called, on the last 16 bits
   */
  NumberOfInitHooksCalledIncrementer = 0b010000000000000000,
  NumberOfInitHooksCalledShift = 16,
  NumberOfInitHooksCalledMask = 0b11111111111111110000000000000000,
}

/**
 * Set of instructions used to process host bindings efficiently.
 *
 * See VIEW_DATA.md for more information.
 */
export interface ExpandoInstructions extends Array<number | HostBindingsFunction<any> | null> { }

/**
 * Explicitly marks `TView` as a specific type in `ngDevMode`
 *
 * It is useful to know conceptually what time of `TView` we are dealing with when
 * debugging an application (even if the runtime does not need it.) For this reason
 * we store this information in the `ngDevMode` `TView` and than use it for
 * better debugging experience.
 */
export const enum TViewType {
  /**
   * Root `TView` is the used to bootstrap components into. It is used in conjunction with
   * `LView` which takes an existing DOM node not owned by Angular and wraps it in `TView`/`LView`
   * so that other components can be loaded into it.
   */
  Root = 0,

  /**
   * `TView` associated with a Component. This would be the `TView` directly associated with the
   * component view (as opposed an `Embedded` `TView` which would be a child of `Component` `TView`)
   */
  Component = 1,

  /**
   * `TView` associated with a template. Such as `*ngIf`, `<ng-template>` etc... A `Component`
   * can have zero or more `Embedede` `TView`s.
   */
  Embedded = 2,
}

/**
 * Converts `TViewType` into human readable text.
 * Make sure this matches with `TViewType`
 */
export const TViewTypeAsString = [
  'Root',       // 0
  'Component',  // 1
  'Embedded',   // 2
] as const;


/**
 * The static data for an LView (shared between all templates of a
 * given type).
 *
 * Stored on the `ComponentDef.tView`.
 */
export interface TView {
   /**
   * Type of `TView` (`Root`|`Component`|`Embedded`).
   */
  type: TViewType;

  /**
   * This is a blueprint used to generate LView instances for this TView. Copying this
   * blueprint is faster than creating a new LView from scratch.
   */
  blueprint: LView;

  /**
   * The template function used to refresh the view of dynamically created views
   * and components. Will be null for inline views.
   */
  template: ComponentTemplate<{}>|null;

  /**
   * A function containing query-related instructions.
   */
  viewQuery: ViewQueriesFunction<{}>|null;

  /**
   * A `TNode` representing the declaration location of this `TView` (not part of this TView).
   */
  declTNode: TNode|null;

  // FIXME(misko): Why does `TView` not have `declarationTView` property?

  /** Whether or not this template has been processed in creation mode. */
  firstCreatePass: boolean;

  /**
   *  Whether or not this template has been processed in update mode (e.g. change detected)
   *
   * `firstUpdatePass` is used by styling to set up `TData` to contain metadata about the styling
   * instructions. (Mainly to build up a linked list of styling priority order.)
   *
   * Typically this function gets cleared after first execution. If exception is thrown then this
   * flag can remain turned un until there is first successful (no exception) pass. This means that
   * individual styling instructions keep track of if they have already been added to the linked
   * list to prevent double adding.
   */
  firstUpdatePass: boolean;

  /** Static data equivalent of LView.data[]. Contains TNodes, PipeDefInternal or TI18n. */
  data: TData;

  /**
   * The binding start index is the index at which the data array
   * starts to store bindings only. Saving this value ensures that we
   * will begin reading bindings at the correct point in the array when
   * we are in update mode.
   *
   * -1 means that it has not been initialized.
   */
  bindingStartIndex: number;

  /**
   * The index where the "expando" section of `LView` begins. The expando
   * section contains injectors, directive instances, and host binding values.
   * Unlike the "decls" and "vars" sections of `LView`, the length of this
   * section cannot be calculated at compile-time because directives are matched
   * at runtime to preserve locality.
   *
   * We store this start index so we know where to start checking host bindings
   * in `setHostBindings`.
   */
  expandoStartIndex: number;

  /**
   * Whether or not there are any static view queries tracked on this view.
   *
   * We store this so we know whether or not we should do a view query
   * refresh after creation mode to collect static query results.
   */
  staticViewQueries: boolean;

  /**
   * Whether or not there are any static content queries tracked on this view.
   *
   * We store this so we know whether or not we should do a content query
   * refresh after creation mode to collect static query results.
   */
  staticContentQueries: boolean;

  /**
   * A reference to the first child node located in the view.
   */
  firstChild: TNode|null;

  /**
   * Stores the OpCodes to be replayed during change-detection to process the `HostBindings`
   *
   * See `HostBindingOpCodes` for encoding details.
   */
  hostBindingOpCodes: HostBindingOpCodes|null;

  /**
   * Full registry of directives and components that may be found in this view.
   *
   * It's necessary to keep a copy of the full def list on the TView so it's possible
   * to render template functions without a host component.
   */
  directiveRegistry: DirectiveDefList|null;

  /**
   * Full registry of pipes that may be found in this view.
   *
   * The property is either an array of `PipeDefs`s or a function which returns the array of
   * `PipeDefs`s. The function is necessary to be able to support forward declarations.
   *
   * It's necessary to keep a copy of the full def list on the TView so it's possible
   * to render template functions without a host component.
   */
  pipeRegistry: PipeDefList|null;

  /**
   * Array of ngOnInit, ngOnChanges and ngDoCheck hooks that should be executed for this view in
   * creation mode.
   *
   * This array has a flat structure and contains TNode indices, directive indices (where an
   * instance can be found in `LView`) and hook functions. TNode index is followed by the directive
   * index and a hook function. If there are multiple hooks for a given TNode, the TNode index is
   * not repeated and the next lifecycle hook information is stored right after the previous hook
   * function. This is done so that at runtime the system can efficiently iterate over all of the
   * functions to invoke without having to make any decisions/lookups.
   */
  preOrderHooks: HookData|null;

  /**
   * Array of ngOnChanges and ngDoCheck hooks that should be executed for this view in update mode.
   *
   * This array has the same structure as the `preOrderHooks` one.
   */
  preOrderCheckHooks: HookData|null;

  /**
   * Array of ngAfterContentInit and ngAfterContentChecked hooks that should be executed
   * for this view in creation mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  contentHooks: HookData|null;

  /**
   * Array of ngAfterContentChecked hooks that should be executed for this view in update
   * mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  contentCheckHooks: HookData|null;

  /**
   * Array of ngAfterViewInit and ngAfterViewChecked hooks that should be executed for
   * this view in creation mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  viewHooks: HookData|null;

  /**
   * Array of ngAfterViewChecked hooks that should be executed for this view in
   * update mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  viewCheckHooks: HookData|null;

  /**
   * Array of ngOnDestroy hooks that should be executed when this view is destroyed.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  destroyHooks: DestroyHookData|null;

  /**
   * When a view is destroyed, listeners need to be released and outputs need to be
   * unsubscribed. This cleanup array stores both listener data (in chunks of 4)
   * and output data (in chunks of 2) for a particular view. Combining the arrays
   * saves on memory (70 bytes per array) and on a few bytes of code size (for two
   * separate for loops).
   *
   * If it's a native DOM listener or output subscription being stored:
   * 1st index is: event name  `name = tView.cleanup[i+0]`
   * 2nd index is: index of native element or a function that retrieves global target (window,
   *               document or body) reference based on the native element:
   *    `typeof idxOrTargetGetter === 'function'`: global target getter function
   *    `typeof idxOrTargetGetter === 'number'`: index of native element
   *
   * 3rd index is: index of listener function `listener = lView[CLEANUP][tView.cleanup[i+2]]`
   * 4th index is: `useCaptureOrIndx = tView.cleanup[i+3]`
   *    `typeof useCaptureOrIndx == 'boolean' : useCapture boolean
   *    `typeof useCaptureOrIndx == 'number':
   *         `useCaptureOrIndx >= 0` `removeListener = LView[CLEANUP][useCaptureOrIndx]`
   *         `useCaptureOrIndx <  0` `subscription = LView[CLEANUP][-useCaptureOrIndx]`
   *
   * If it's an output subscription or query list destroy hook:
   * 1st index is: output unsubscribe function / query list destroy function
   * 2nd index is: index of function context in LView.cleanupInstances[]
   *               `tView.cleanup[i+0].call(lView[CLEANUP][tView.cleanup[i+1]])`
   */
  cleanup: any[]|null;

  /**
   * A list of element indices for child components that will need to be
   * refreshed when the current view has finished its check. These indices have
   * already been adjusted for the HEADER_OFFSET.
   *
   */
  components: number[]|null;

  /**
   * A collection of queries tracked in a given view.
   */
  queries: TQueries|null;

  /**
   * An array of indices pointing to directives with content queries alongside with the
   * corresponding query index. Each entry in this array is a tuple of:
   * - index of the first content query index declared by a given directive;
   * - index of a directive.
   *
   * We are storing those indexes so we can refresh content queries as part of a view refresh
   * process.
   */
  contentQueries: number[]|null;

  /**
   * Set of schemas that declare elements to be allowed inside the view.
   */
  schemas: SchemaMetadata[]|null;

  /**
   * Array of constants for the view. Includes attribute arrays, local definition arrays etc.
   * Used for directive matching, attribute bindings, local definitions and more.
   */
  consts: TConstants|null;

  /**
   * Indicates that there was an error before we managed to complete the first create pass of the
   * view. This means that the view is likely corrupted and we should try to recover it.
   */
  incompleteFirstPass: boolean;
}

export interface HostBindingOpCodes extends Array<number|HostBindingsFunction<any>> {
  __brand__: 'HostBindingOpCodes';
  debug?: string[];
}

export const enum RootContextFlags {
  Empty = 0b00,
  DetectChanges = 0b01,
  FlushPlayers = 0b10
}


/**
 * RootContext contains information which is shared for all components which
 * were bootstrapped with {@link renderComponent}.
 */
export interface RootContext {
  /**
   * A function used for scheduling change detection in the future. Usually
   * this is `requestAnimationFrame`.
   */
  scheduler: (workFn: () => void) => void;

  /**
   * A promise which is resolved when all components are considered clean (not dirty).
   *
   * This promise is overwritten every time a first call to {@link markDirty} is invoked.
   */
  clean: Promise<null>;

  /**
   * RootComponents - The components that were instantiated by the call to
   * {@link renderComponent}.
   */
  components: {}[];

  /**
   * The player flushing handler to kick off all animations
   */
  playerHandler: PlayerHandler | null;

  /**
   * What render-related operations to run once a scheduler has been set
   */
  flags: RootContextFlags;
}

/** Single hook callback function. */
export type HookFn = () => void;

/**
 * Information necessary to call a hook. E.g. the callback that
 * needs to invoked and the index at which to find its context.
 */
export type HookEntry = number | HookFn;

/**
 * Array of hooks that should be executed for a view and their directive indices.
 *
 * For each node of the view, the following data is stored:
 * 1) Node index (optional)
 * 2) A series of number/function pairs where:
 *  - even indices are directive indices
 *  - odd indices are hook functions
 *
 * Special cases:
 *  - a negative directive index flags an init hook (ngOnInit, ngAfterContentInit, ngAfterViewInit)
 */
export type HookData = HookEntry[];

/**
 * Array of destroy hooks that should be executed for a view and their directive indices.
 *
 * The array is set up as a series of number/function or number/(number|function)[]:
 * - Even indices represent the context with which hooks should be called.
 * - Odd indices are the hook functions themselves. If a value at an odd index is an array,
 *   it represents the destroy hooks of a `multi` provider where:
 *     - Even indices represent the index of the provider for which we've registered a destroy hook,
 *       inside of the `multi` provider array.
 *     - Odd indices are the destroy hook functions.
 * For example:
 * LView: `[0, 1, 2, AService, 4, [BService, CService, DService]]`
 * destroyHooks: `[3, AService.ngOnDestroy, 5, [0, BService.ngOnDestroy, 2, DService.ngOnDestroy]]`
 *
 * In the example above `AService` is a type provider with an `ngOnDestroy`, whereas `BService`,
 * `CService` and `DService` are part of a `multi` provider where only `BService` and `DService`
 * have an `ngOnDestroy` hook.
 */
export type DestroyHookData = (HookEntry | HookData)[];

/**
 * Static data that corresponds to the instance-specific data array on an LView.
 *
 * Each node's static data is stored in tData at the same index that it's stored
 * in the data array.  Any nodes that do not have static data store a null value in
 * tData to avoid a sparse array.
 *
 * Each pipe's definition is stored here at the same index as its pipe instance in
 * the data array.
 *
 * Each host property's name is stored here at the same index as its value in the
 * data array.
 *
 * Each property binding name is stored here at the same index as its value in
 * the data array. If the binding is an interpolation, the static string values
 * are stored parallel to the dynamic values. Example:
 *
 * id="prefix {{ v0 }} a {{ v1 }} b {{ v2 }} suffix"
 *
 * LView       |   TView.data
 *------------------------
 *  v0 value   |   'a'
 *  v1 value   |   'b'
 *  v2 value   |   id � prefix � suffix
 *
 * Injector bloom filters are also stored here.
 */
export type TData =
  (TNode | PipeDef<any> | DirectiveDef<any> | ComponentDef<any> | number | TStylingRange | TStylingKey |
    Token | null)[];
