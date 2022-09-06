// FIXME pretty sure we can re-work this w the new DB type.

export const resolvers = {
  FixitUser: {
    __resolveType: (obj) => {
      return Object.prototype.hasOwnProperty.call(obj, "isActive")
        ? "Contact"
        : Object.prototype.hasOwnProperty.call(obj, "email")
        ? "User"
        : null;
    }
  }
};
