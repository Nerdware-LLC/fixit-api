/**
 * A type-guard which uses `Object.prototype.hasOwnProperty.call` to ensure
 * the provided `obj` has the provided `key` as an own-property.
 */
export const hasKey = <Obj extends Record<PropertyKey, any>, Key extends PropertyKey>(
  obj: Obj,
  key: Key
): obj is Obj & Record<Key, Obj[Key]> => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * A type-guard which uses `Object.prototype.hasOwnProperty.call` to ensure
 * the provided `obj` has all of the provided `keys` as an own-property.
 */
export const hasKeys = <Obj extends Record<PropertyKey, any>, Keys extends Array<PropertyKey>>(
  obj: Obj,
  keys: Keys
): obj is Obj & Record<Keys[number], Obj[Keys[number]]> => {
  return keys.every((key) => Object.prototype.hasOwnProperty.call(obj, key));
};
