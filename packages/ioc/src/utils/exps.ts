export const clsStartExp = /^[A-Z@]/;
export const clsUglifyExp = /^[a-z0-9]$/;
export const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
export const ARGUMENT_NAMES = /([^\s,]+)/g;
export const refInjExp = /^Ref\s+[\w\{\}]+\sfor/;