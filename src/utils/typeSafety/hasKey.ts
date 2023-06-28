/**
 * A type-guard which uses `Object.prototype.hasOwnProperty.call` to
 * ensure the provided `obj` has the provided `key` as an own-property.
 */
export const hasKey = <Obj extends Record<PropertyKey, any>, Key extends PropertyKey>(
  obj: Obj,
  key: Key
): obj is Obj & Record<Key, unknown> => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
