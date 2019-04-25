import { BootContext, createAnnoationContext } from '@tsdi/boot';
import { UnitTestConfigure, UnitTestOptions } from './UnitTestConfigure';
import { Type } from '@tsdi/ioc';
import { IContainer } from '@tsdi/core';


export class UnitTestContext extends BootContext {

    configures?: (string | UnitTestConfigure)[];

    static parse(target: Type<any> | UnitTestOptions, raiseContainer?: IContainer | (() => IContainer)): UnitTestContext {
        return createAnnoationContext(UnitTestContext, target, raiseContainer);
    }
}