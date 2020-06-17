import { Token, ClassType, tokenId, Modules, TokenId } from '@tsdi/ioc';

export const CTX_CURR_TOKEN: TokenId<Token> = tokenId<Token>('CTX_CURR_TOKEN');
export const CTX_CURR_TYPE = tokenId<ClassType>('CTX_CURR_TYPE');
export const CTX_TARGET_REFS = tokenId<any[]>('CTX_TARGET_REFS');
export const CTX_TOKENS = tokenId<Token[]>('CTX_TOKENS');
export const CTX_ALIAS = tokenId<string>('CTX_ALIAS');
export const CTX_TYPES = tokenId<ClassType[]>('CTX_TOKENS');
export const CTX_INJ_MODULE = tokenId<Modules>('CTX_INJ_MODULE');
