export const batchGetUsersByID = async function (userIDs) {
  return await this.batchGet(userIDs.map((id) => ({ id, sk: `#DATA#${id}` })));
};
