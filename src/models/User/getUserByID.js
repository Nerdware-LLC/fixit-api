export const getUserByID = async function (userID) {
  return await this.get({ id: userID, sk: `#DATA#${userID}` });
};
