import { IAdviceMatcher } from './IAdviceMatcher';
import { AdviceMetadata } from './metadatas/index';
import { DecoratorType, NonePointcut, MethodMetadata, getOwnMethodMetadata, hasOwnMethodMetadata, hasOwnClassMetadata } from '../core/index';
import { Type } from '../Type';
import { symbols, isString, isRegExp } from '../utils/index';
import { IPointcut } from './IPointcut';
import { ObjectMap, Express3 } from '../types';
import { MatchPointcut } from './MatchPointcut';
import { Aspect, Advice } from './decorators/index';

@NonePointcut()
export class AdviceMatcher implements IAdviceMatcher {

    constructor() {

    }

    match(aspectType: Type<any>, type: Type<any>, adviceMetas?: ObjectMap<AdviceMetadata[]>, instance?: any): MatchPointcut[] {

        let className = type.name;

        adviceMetas = adviceMetas || getOwnMethodMetadata<AdviceMetadata>(Advice, type);
        let matched: MatchPointcut[] = [];

        if (type === aspectType) {
            let adviceNames = Object.keys(adviceMetas);
            if (adviceNames.length > 1) {
                let advices: AdviceMetadata[] = [];
                adviceNames.forEach(n => {
                    advices = advices.concat(adviceMetas[n]);
                });

                adviceNames.forEach(n => {
                    advices.forEach(adv => {
                        if (adv.propertyKey !== n) {
                            if (this.matchAspectSelf(n, adv)) {
                                matched.push({
                                    name: n,
                                    fullName: `${aspectType.name}.${n}`,
                                    advice: adv
                                });
                            }
                        }
                    })
                });
            }
        } else {
            let points: IPointcut[] = [];
            // match method.
            for (let name in Object.getOwnPropertyDescriptors(type.prototype)) {
                points.push({
                    name: name,
                    fullName: `${className}.${name}`
                });
            }

            // match property
            Object.getOwnPropertyNames(instance || type.prototype).forEach(name => {
                points.push({
                    name: name,
                    fullName: `${className}.${name}`
                });
            });

            Object.keys(adviceMetas).forEach(name => {
                let advices = adviceMetas[name];
                advices.forEach(metadata => {
                    matched = matched.concat(this.filterPointcut(type, points, metadata));
                });

            });
        }

        return matched;

    }

    protected matchAspectSelf(name: string, metadata: AdviceMetadata): boolean {
        if (metadata.pointcut) {
            let pointcut = metadata.pointcut;

            if (isString(pointcut)) {
                if (/^execution\(\S+\)$/.test(pointcut)) {
                    pointcut = pointcut.substring(10, pointcut.length - 1);
                    return pointcut === name;
                }
            } else if (isRegExp(pointcut)) {
                return pointcut.test(name);
            }
        }
        return false;
    }

    filterPointcut(type: Type<any>, points: IPointcut[], metadata: AdviceMetadata): MatchPointcut[] {
        if (!metadata.pointcut) {
            return [];
        }
        let matchedPointcut;
        if (metadata.pointcut) {
            let match = this.matchTypeFactory(type, metadata.pointcut);
            matchedPointcut = points.filter(p => match(p.name, p.fullName, p))
        }

        matchedPointcut = matchedPointcut || [];
        return matchedPointcut.map(p => {
            return Object.assign({}, p, { advice: metadata });
        });
    }


    protected matchTypeFactory(type: Type<any>, pointcut: string | RegExp): Express3<string, string, IPointcut, boolean> {
        if (isString(pointcut)) {
            pointcut = (pointcut || '').trim();
            if (/^@annotation\(\S+\)$/.test(pointcut)) {
                pointcut = pointcut.substring(12, pointcut.length - 1);
                let annotation = /^@/.test(pointcut) ? pointcut : ('@' + pointcut);
                return (name: string, fullName: string) => hasOwnMethodMetadata(annotation, type, name) && !hasOwnClassMetadata(Aspect, type);

            } else {
                if (pointcut === '*' || pointcut === '*.*') {
                    return (name: string, fullName: string, pointcut: IPointcut) => !!name;
                }

                if (/^execution\(\S+\)$/.test(pointcut)) {
                    pointcut = pointcut.substring(10, pointcut.length - 1);
                }
                pointcut = pointcut.replace(/\*\*/gi, '(\\\w+(\\\.|\\\/)){0,}\\\w+')
                    .replace(/\*/gi, '\\\w+')
                    .replace(/\./gi, '\\\.')
                    .replace(/\//gi, '\\\/');
                let matcher = new RegExp(pointcut + '$');

                return (name: string, fullName: string, pointcut: IPointcut) => matcher.test(fullName);
            }
        } else if (isRegExp(pointcut)) {
            let pointcutReg = pointcut;
            if (/^\^?@\w+/.test(pointcutReg.source)) {
                return (name: string, fullName: string, pointcut: IPointcut) => {
                    let decName = Reflect.getMetadataKeys(type, name);
                    return decName.some(n => isString(n) && pointcutReg.test(n));
                }

            } else {
                return (name: string, fullName: string, pointcut: IPointcut) => pointcutReg.test(fullName);
            }
        }
        return null;
    }



}
