import type { Simplify } from "type-fest";

/**
 * Get a shallow copy of an object with only the specified keys.
 */
export const getObjValuesByKeys = <
  Obj extends Record<string, any>,
  ObjKeysArray extends Array<keyof Obj>
>(
  keysArray: ObjKeysArray,
  srcObj: Obj
): Simplify<Pick<Obj, ObjKeysArray[number]>> => {
  return keysArray.reduce((accum, key) => {
    if (Object.prototype.hasOwnProperty.call(srcObj, key)) {
      accum[key] = srcObj[key];
    }
    return accum;
  }, {} as Pick<Obj, ObjKeysArray[number]>);
};
