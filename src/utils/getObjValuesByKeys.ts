export const getObjValuesByKeys = (keysArray: Array<string>, srcObj: Record<string, any>) => {
  return keysArray.reduce<Record<string, any>>((accum, key) => {
    if (Object.prototype.hasOwnProperty.call(srcObj, key)) {
      accum[key] = srcObj[key];
    }
    return accum;
  }, {});
};
