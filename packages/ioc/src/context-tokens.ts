import { InjectToken } from './InjectToken';
import { ActionContextOption } from './actions/Action';
import { ProviderMap } from './providers/ProviderMap';
import { IParameter } from './IParameter';
import { ProviderTypes } from './providers';

export const CTX_OPTIONS = new InjectToken<ActionContextOption>('CTX_OPTIONS');
export const CTX_PROVIDER_MAP = new InjectToken<ProviderMap>('CTX_PROVIDER_MAP');
export const CTX_PROVIDERS = new InjectToken<ProviderTypes[]>('CTX_PROVIDERS');
export const CTX_PARAMS = new InjectToken<IParameter[]>('CTX_PARAMS');
export const CTX_ARGS = new InjectToken<any[]>('CTX_ARGS');

export const CTX_CURR_SCOPE = new InjectToken<any>('CTX_CURR_SCOPE');
export const CTX_CURR_DECOR = new InjectToken<string>('CTX_CURR_DECOR');
export const CTX_CURR_DECOR_SCOPE = new InjectToken<any>('CTX_CURR_DECOR_SCOPE');