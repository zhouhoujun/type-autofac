import { DIModule } from '@ts-ioc/bootstrap';
import { BuildModule } from '@taskfr/build';
import { PackSetup } from './PackSetup';
import * as cores from './core';
import * as builds from './build';
import * as serves from './serves';
import * as generate from './generate';

@DIModule({
    imports: [
        BuildModule,
        PackSetup,
        cores,
        builds,
        generate,
        serves
    ],
    exports: [
        BuildModule,
        cores,
        builds,
        generate,
        serves
    ]
})
export class PackModule {

}
