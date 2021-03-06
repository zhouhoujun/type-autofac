# packaged @tsdi/unit-console

This repo is for distribution on `npm`. The source for this module is in the
[main repo](https://github.com/zhouhoujun/tsioc).

`@tsdi/unit-console`： unit testing console reporter, base on AOP, Ioc container.

version 5+ of [`@ts-ioc/core`](https://www.npmjs.com/package/@ts-ioc/core) [`tsioc`](https://www.npmjs.com/package/tsioc)
# Install

```shell

npm install @tsdi/unit
npm install @tsdi/unit-console

// in browser
npm install @tsdi/platform-browser

// in server
npm install @tsdi/platform-server
```

## add extends modules

### use unit


```ts

import { Suite, BeforeEach, UnitTest, Test, After, AfterEach Assert, Expect, ExpectToken } from '@tsdi/unit';
import { ConsoleReporter } from '@tsdi/unit-console';
import { PromiseUtil } from '@tsdi/core';


@Suite('Unit Test')
export class SuiteTest {

    // testContainer: AnyApplicationBuilder;

    @BeforeEach()
    async initTest() {
        console.log('---------beofre test-----------');
    }

    @Test('assert test timeout', 200)
    testTimeout() {
        console.log('--------assert test timeout------');
        let def = PromiseUtil.defer();
        setTimeout(() => {
            def.resolve('out time do...')
        }, 300)
        return def.promise;
    }

    @Test('assert test in time', 200)
    testInTime() {
        console.log('--------assert test in time------');
        let def = PromiseUtil.defer();
        setTimeout(() => {
            def.resolve('in time do...')
        }, 100)
        return def.promise;
    }


    @Test('assert test in time', 200)
    testInTime(assert: Assert) {
        console.log('--------assert test in time------');
        let def = PromiseUtil.defer();
        setTimeout(() => {
            def.resolve('in time do...')
        }, 100)
        assert.strictEqual('0', 0);
        return def.promise;
    }

    @Test('expect test')
    async testEqural(@Inject(ExpectToken) expect: Expect) {
        await expect('true').toBe(true);
    }

    @AfterEach()
    clean(){
        //clean each data.
    }

    @After()
    destory(){

    }
}


```

### support old TDD BDD style unit test.
* TDD-style interface:
```js
suite('Array', function() {
  suite('#indexOf()', function() {
    suiteSetup(function() {
    });
    test('should return -1 when not present', function() {
    });
    test('should return the index when present', function() {
    });
    suiteTeardown(function() {
    });
  });
});
```
* BDD-style interface:
```js
describe('Array', function(){
    describe('Array#indexOf()', function() {
        it('should return -1 when not present', function() {
        // ...
        });
        it('should return the index when present', function() {
        // ...
        });
    });
});
```

### custom run test code

* use runTest to run

```ts
// run Test
/**
 * unit test.
 *
 * @export
 * @param {(string | Type | (string | Type)[])} src test source.
 * @param {(string | AppConfigure)} [config] test configure.
 * @param {...LoadType[]} deps custom set unit test dependencies.
 * @returns {Promise<any>}
 */
export function runTest(src: string | Type | (string | Type)[], config?: string | UnitTestConfigure, ...deps: LoadType[]): Promise<any>;

runTest(SuiteTest, {...}, ConsoleReporter);

```

* use boot application
```ts
import { BootApplication, DIModule, ConfigureRegister } from '@tsdi/boot';
import { UnitTest } from '@tsdi/unit';

BootApplication.run(UnitTestContext.parse({ module: UnitTest, deps: [ConsoleReporter], configures: [config, { src: src }] }))
```

### use command run test code
`tsdi test [test/**/*.ts]`

```shell

tsdi test  //default load test/**/*.ts

//or
tsdi test test/**/*.ts

```


* test result:
![image](https://github.com/zhouhoujun/tsioc/blob/master/packages/unit-console/assets/ConsoleReport1.png?raw=true)


## Documentation
Documentation is available on the
* [@tsdi/ioc document](https://github.com/zhouhoujun/tsioc/tree/master/packages/ioc).
* [@tsdi/aop document](https://github.com/zhouhoujun/tsioc/tree/master/packages/aop).
* [@tsdi/core document](https://github.com/zhouhoujun/tsioc/tree/master/packages/core).
* [@tsdi/boot document](https://github.com/zhouhoujun/tsioc/tree/master/packages/boot).
* [@tsdi/components document](https://github.com/zhouhoujun/tsioc/tree/master/packages/components).
* [@tsdi/compiler document](https://github.com/zhouhoujun/tsioc/tree/master/packages/compiler).
* [@tsdi/activities document](https://github.com/zhouhoujun/tsioc/tree/master/packages/activities).
* [@tsdi/pack document](https://github.com/zhouhoujun/tsioc/tree/master/packages/pack).
* [@tsdi/typeorm-adapter document](https://github.com/zhouhoujun/tsioc/tree/master/packages/typeorm-adapter).
* [@tsdi/unit document](https://github.com/zhouhoujun/tsioc/tree/master/packages/unit).
* [@tsdi/unit-console document](https://github.com/zhouhoujun/tsioc/tree/master/packages/unit-console).
* [@tsdi/cli document](https://github.com/zhouhoujun/tsioc/tree/master/packages/cli).


### packages
[@tsdi/cli](https://www.npmjs.com/package/@tsdi/cli)
[@tsdi/ioc](https://www.npmjs.com/package/@tsdi/ioc)
[@tsdi/aop](https://www.npmjs.com/package/@tsdi/aop)
[@tsdi/core](https://www.npmjs.com/package/@tsdi/core)
[@tsdi/boot](https://www.npmjs.com/package/@tsdi/boot)
[@tsdi/components](https://www.npmjs.com/package/@tsdi/components)
[@tsdi/compiler](https://www.npmjs.com/package/@tsdi/compiler)
[@tsdi/activities](https://www.npmjs.com/package/@tsdi/activities)
[@tsdi/pack](https://www.npmjs.com/package/@tsdi/pack)
[@tsdi/typeorm-adapter](https://www.npmjs.com/package/@tsdi/typeorm-adapter)
[@tsdi/unit](https://www.npmjs.com/package/@tsdi/unit)
[@tsdi/unit-console](https://www.npmjs.com/package/@tsdi/unit-console)

## License

MIT © [Houjun](https://github.com/zhouhoujun/)