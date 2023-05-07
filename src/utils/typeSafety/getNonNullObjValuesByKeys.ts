import type { Simplify, SetNonNullable } from "type-fest";

/**
 * Get a shallow copy of an object with only the specified keys IF the value is
 * neither null nor undefined.
 */
export const getNonNullObjValuesByKeys = <
  Obj extends Record<string, any>,
  ObjKeysArray extends Array<keyof Obj>
>(
  keysArray: ObjKeysArray,
  srcObj: Obj
): Simplify<
  SetNonNullable<{ [K in keyof Obj]: Obj[K] extends null | undefined ? never : Simplify<Obj[K]> }>
> => {
  return keysArray.reduce((accum, key) => {
    if (
      Object.prototype.hasOwnProperty.call(srcObj, key) &&
      srcObj[key] !== null &&
      srcObj[key] !== undefined
    ) {
      accum[key] = srcObj[key];
    }
    return accum;
  }, {} as { [K in keyof Obj]: Obj[K] extends null | undefined ? never : Obj[K] });
};
