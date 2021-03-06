import { Singleton, MethodMetadata } from '@tsdi/ioc';
import { Aspect, Joinpoint, Pointcut } from '@tsdi/aop';
import { LoggerAspect } from '../src';

@Singleton
@Aspect
export class AnntotationLogAspect extends LoggerAspect {

    @Pointcut('@annotation(Logger)', 'logAnnotation')
    logging(logAnnotation: MethodMetadata[], joinPoint: Joinpoint) {
        this.processLog(joinPoint, logAnnotation);
    }
}
