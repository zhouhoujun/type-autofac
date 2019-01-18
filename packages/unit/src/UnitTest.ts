import {
   ApplicationBuilder, ModuleConfigure, ModuleConfig, Runnable, RunOptions,
   AppConfigure
} from '@ts-ioc/bootstrap';
import { UnitModule } from './UnitModule';
import {
   isClass, hasClassMetadata, Type, isString, isArray, Token,
   LoadType, IContainerBuilder, lang, ContainerBuilder, PromiseUtil
} from '@ts-ioc/core';
import { Suite } from './decorators/Suite';
import { TestReport, ITestReport } from './reports';
import { SuiteRunner, OldTestRunner } from './runner';
import { Assert, ExpectToken } from './assert';
import * as assert from 'assert';
import * as expect from 'expect';

/**
 * unit test options.
 *
 * @export
 * @interface UnitTestOptions
 * @extends {RunOptions<any>}
 */
export interface UnitTestOptions extends RunOptions<any> {
   report?: boolean;
}

/**
 * unit test configure.
 *
 * @export
 * @interface UnitTestConfigure
 * @extends {AppConfigure}
 */
export interface UnitTestConfigure extends AppConfigure {
   /**
    * resports.
    *
    * @type {Token<ITestReport>[]}
    * @memberof UnitTestConfigure
    */
   reporters: Type<ITestReport>[];
}


/**
 * unit test.
 *
 * @export
 * @class UnitTest
 * @extends {ApplicationBuilder<any>}
 */
export class UnitTest extends ApplicationBuilder<any> {
   constructor() {
      super();
      this.initUnit();
   }

   /**
    * create unit test.
    *
    * @static
    * @param {(string | UnitTestConfigure)} [config]
    * @returns
    * @memberof UnitTest
    */
   static create(config?: string | UnitTestConfigure) {
      let unit = new UnitTest();
      if (config) {
         unit.useConfiguration(config);
      }
      return unit;
   }

   initUnit() {
      this.use(UnitModule);
   }

   getTopBuilder(): IContainerBuilder {
      let c = this.getPools().values().find(c => lang.getClass(c.getBuilder()) !== ContainerBuilder);
      if (c) {
         return c.getBuilder();
      }
      return this.getPools().getDefault().getBuilder();
   }

   async initContainerPools() {
      await super.initContainerPools();
      if (!this.hasRegister(Assert)) {
         this.getPools().getDefault().bindProvider(Assert, () => assert);
      }
      if (!this.hasRegister(ExpectToken)) {
         this.getPools().getDefault().bindProvider(ExpectToken, () => expect);
      }
   }


   async test(src: string | Type<any> | (Type<any> | string)[]) {
      await this.initContainerPools();
      let suites: any[] = [];
      let dbuiler = this.getTopBuilder();

      let oldRunner = this.resolve(OldTestRunner);

      oldRunner.registerGlobalScope();
      if (isString(src)) {
         let alltypes = await dbuiler.loader.loadTypes([{ files: [src] }]);
         alltypes.forEach(tys => {
            suites = suites.concat(tys);
         })
      } else if (isClass(src)) {
         suites = [src];
      } else if (isArray(src)) {
         if (src.some(t => isClass(t))) {
            suites = src;
         } else {
            let alltypes = await dbuiler.loader.loadTypes([{ files: src }]);
            alltypes.forEach(tys => {
               suites = suites.concat(tys);
            })
         }
      }
      oldRunner.unregisterGlobalScope();
      await oldRunner.run();
      await PromiseUtil.step(suites.filter(v => isClass(v) && hasClassMetadata(Suite, v)).map(s => () => this.bootstrap(s, { report: false })));
      await this.resolve(TestReport).report();
   }


   async bootstrap(token: Token<any> | ModuleConfigure, config?: ModuleConfig<any> | UnitTestOptions, options?: UnitTestOptions): Promise<Runnable<any>> {
      let params = this.vaildParams(token, config, options);
      let opt = params.options as UnitTestOptions;
      let runner = await super.bootstrap(params.token, params.config, opt) as SuiteRunner;
      if (!(opt && opt.report === false)) {
         await this.resolve(TestReport).report();
      }
      return runner;
   }
}

/**
 * unit test.
 *
 * @export
 * @param {string | string[]} src
 * @param {(string | AppConfigure)} [config]
 * @param {...LoadType[]} used
 * @returns {Promise<any>}
 */
export async function runTest(src: string | string[], config?: string | AppConfigure, ...used: LoadType[]): Promise<any> {
   let unit = new UnitTest();
   if (config) {
      unit.useConfiguration(config);
   }
   if (used.length) {
      unit.use(...used);
   }
   await unit.test(src);
}
