import {
    IActivity, Src, ActivityBuilder, SequenceConfigure,
    SequenceActivityToken, ParallelConfigure, ParallelActivityToken, SequenceActivity, ParallelActivity
} from '@taskfr/core';
import { Injectable, lang, isString, isArray, hasClassMetadata } from '@ts-ioc/core';
import { PackActivity } from './PackActivity';
import {
    CleanActivity, CleanConfigure, TestActivity, TestConfigure, AssetActivity,
    AssetConfigure, InjectAssetToken, BuildHandleToken, Asset,
    BuildHandleActivity, CleanToken, TestToken, AssetToken, StreamAssetToken, StreamAssetConfigure
} from '@taskfr/build';
import { PackConfigure } from './PackConfigure';
import { PackBuilderToken } from './IPackActivity';


/**
 * pack activity builder
 *
 * @export
 * @class PackBuilder
 * @extends {ActivityBuilder}
 */
@Injectable(PackBuilderToken)
export class PackBuilder extends ActivityBuilder {

    /**
     * package build stragegy.
     *
     * @param {IActivity} activity
     * @param {PackConfigure} config
     * @returns {Promise<IActivity>}
     * @memberof PackBuilder
     */
    async buildStrategy(activity: IActivity, config: PackConfigure): Promise<IActivity> {
        await super.buildStrategy(activity, config);
        if (activity instanceof PackActivity) {
            let srcRoot = activity.src = activity.context.to(config.src);
            let assets = await Promise.all(lang.keys(config.assets).map(name => {
                return this.toActivity<Src, AssetActivity, AssetConfigure>(config.assets[name], activity,
                    (act: any) => {
                        let flag = act instanceof BuildHandleActivity
                            || act instanceof SequenceActivity
                            || act instanceof ParallelActivity
                        if (flag) {
                            return true;
                        } else if (act) {
                            return hasClassMetadata(Asset, lang.getClass(act));
                        }
                        return false;
                    },
                    src => {
                        if (isString(src) || isArray(src)) {
                            return <AssetConfigure>{ src: src };
                        } else {
                            return null;
                        }
                    },
                    cfg => {
                        if (!cfg) {
                            return null;
                        }
                        let seqcfg = cfg as SequenceConfigure;
                        if (isArray(seqcfg.sequence)) {
                            if (!seqcfg.activity && !seqcfg.task) {
                                seqcfg.task = SequenceActivityToken;
                            }
                            return seqcfg;
                        }

                        let parcfg = cfg as ParallelConfigure;
                        if (isArray(parcfg.parallel)) {
                            if (!parcfg.activity && !parcfg.task) {
                                parcfg.task = ParallelActivityToken;
                            }
                            return parcfg;
                        }

                        let assCfg = cfg as StreamAssetConfigure;
                        if (!assCfg.activity && !assCfg.task) {
                            assCfg.task = new InjectAssetToken(name);
                        }

                        if (isString(assCfg.task)) {
                            assCfg.task = new InjectAssetToken(assCfg.task);
                        }
                        if (!this.container.has(assCfg.task)) {
                            assCfg.task = isArray(assCfg.pipes) ? StreamAssetToken : AssetToken;
                        }

                        if (srcRoot && !assCfg.src) {
                            assCfg.src = `${srcRoot}/**/*.${name}`;
                        }
                        return assCfg;
                    })
                    .then(a => {
                        if (!a) {
                            return null;
                        }
                        if (!(a instanceof BuildHandleActivity)) {
                            let handle = this.container.resolve(BuildHandleToken);

                            handle.compiler = a;
                            handle.name = 'handle-' + name;
                            return handle;
                        }
                        return a;
                    })
            }));

            activity.use(...assets.filter(a => a));

            if (config.clean) {
                activity.clean = await this.toActivity<Src, CleanActivity, CleanConfigure>(config.clean, activity,
                    act => act instanceof CleanActivity,
                    src => {
                        return <CleanConfigure>{ clean: src, activity: CleanToken };
                    }
                );
            }

            if (config.test) {
                activity.test = await this.toActivity<Src, TestActivity, TestConfigure>(config.test, activity,
                    act => act instanceof TestActivity,
                    src => {
                        if (!src) {
                            return null;
                        }
                        return <TestConfigure>{ src: src, activity: TestToken };
                    }
                );
            }
        }
        return activity;
    }
}
