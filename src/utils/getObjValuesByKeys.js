export const getObjValuesByKeys = (keysArray, srcObj) => {
  return keysArray.reduce((accum, key) => {
    if (Object.prototype.hasOwnProperty.call(srcObj, key)) {
      accum[key] = srcObj[key];
    }
    return accum;
  }, {});
};
