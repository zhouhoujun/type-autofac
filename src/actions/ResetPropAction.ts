import { ActionComposite } from './ActionComposite';
import { ActionData } from './ActionData';
import { ActionType } from './ActionType';
import { DecoratorType } from '../decorators';
import { PropertyMetadata } from '../metadatas/index';
import { IContainer } from '../IContainer';


export interface ResetPropData extends ActionData<PropertyMetadata> {
    props: PropertyMetadata[];
}

export class ResetPropAction extends ActionComposite {

    constructor(decorName?: string, decorType?: DecoratorType) {
        super(ActionType.resetPropType.toString(), decorName, decorType)
    }

    protected working(container: IContainer, data: ResetPropData) {
        let restPropdata = data as ResetPropData;
        let props = data.propMetadata;
        if (Array.isArray(props)) {
            props = {};
        }
        let list: PropertyMetadata[] = [];
        for (let n in props) {
            list = list.concat(props[n]);
        }
        list = list.filter(n => !!n);
        list.forEach(parm => {
            if (container.isVaildDependence(parm.provider)) {
                if (!container.has(parm.provider, parm.alias)) {
                    container.register(container.getToken(parm.provider, parm.alias));
                }
            }
            if (container.isVaildDependence(parm.type)) {
                if (!container.has(parm.type)) {
                    container.register(parm.type);
                }
            }
        });

        restPropdata.props = (restPropdata.props || []).concat(list);
    }
}

