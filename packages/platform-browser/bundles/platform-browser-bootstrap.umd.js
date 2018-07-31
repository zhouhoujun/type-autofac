(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('tslib'), require('@ts-ioc/core'), require('@ts-ioc/bootstrap'), require('@ts-ioc/platform-browser')) :
	typeof define === 'function' && define.amd ? define(['tslib', '@ts-ioc/core', '@ts-ioc/bootstrap', '@ts-ioc/platform-browser'], factory) :
	(global['platform-browser-bootstrap'] = global['platform-browser-bootstrap'] || {}, global['platform-browser-bootstrap'].umd = global['platform-browser-bootstrap'].umd || {}, global['platform-browser-bootstrap'].umd.js = factory(global.tslib_1,global['@ts-ioc/core'],global.bootstrap,global.platformBrowser));
}(this, (function (tslib_1,core_1,bootstrap,platformBrowser) { 'use strict';

tslib_1 = tslib_1 && tslib_1.hasOwnProperty('default') ? tslib_1['default'] : tslib_1;
core_1 = core_1 && core_1.hasOwnProperty('default') ? core_1['default'] : core_1;
bootstrap = bootstrap && bootstrap.hasOwnProperty('default') ? bootstrap['default'] : bootstrap;
platformBrowser = platformBrowser && platformBrowser.hasOwnProperty('default') ? platformBrowser['default'] : platformBrowser;

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var ApplicationBuilder_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




/**
 * default app configuration.
 */
var defaultAppConfig = {
    baseURL: '',
    debug: false,
    connections: {},
    setting: {}
};
/**
 * application builder for browser side.
 *
 * @export
 * @class ApplicationBuilder
 * @extends {DefaultApplicationBuilder}
 * @implements {IBroserApplicationBuilder<T>}
 */
var ApplicationBuilder = /** @class */ (function (_super) {
    tslib_1.__extends(ApplicationBuilder, _super);
    function ApplicationBuilder(baseURL) {
        return _super.call(this, baseURL || !core_1.isUndefined(System) ? System.baseURL : location.href) || this;
    }
    /**
     * create instance.
     *
     * @static
     * @param {string} [baseURL] application start up base path.
     * @returns {ApplicationBuilder} ApplicationBuilder instance.
     * @memberof PlatformBrowser
     */
    ApplicationBuilder.create = function (baseURL) {
        return new ApplicationBuilder(baseURL);
    };
    ApplicationBuilder.prototype.createContainerBuilder = function () {
        return new platformBrowser.ContainerBuilder();
    };
    ApplicationBuilder.prototype.createBuilder = function () {
        return this;
    };
    ApplicationBuilder.prototype.getDefaultConfig = function () {
        return core_1.lang.assign({}, defaultAppConfig);
    };
    ApplicationBuilder.classAnnations = { "name": "ApplicationBuilder", "params": { "constructor": ["baseURL"], "create": ["baseURL"], "createContainerBuilder": [], "createBuilder": [], "getDefaultConfig": [] } };
    return ApplicationBuilder;
}(bootstrap.DefaultApplicationBuilder));
exports.ApplicationBuilder = ApplicationBuilder;


});

unwrapExports(ApplicationBuilder_1);
var ApplicationBuilder_2 = ApplicationBuilder_1.ApplicationBuilder;

var D__workspace_github_tsioc_packages_platformBrowser_bootstrap_lib = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

tslib_1.__exportStar(ApplicationBuilder_1, exports);


});

var index = unwrapExports(D__workspace_github_tsioc_packages_platformBrowser_bootstrap_lib);

return index;

})));
