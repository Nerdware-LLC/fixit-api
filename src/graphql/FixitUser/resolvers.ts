import type { Resolvers } from "@types";

export const resolvers: Partial<Resolvers> = {
  FixitUser: {
    __resolveType: (obj, { user }): "User" | "Contact" | null => {
      return "__typename" in obj
        ? (obj["__typename"] as UserOrContactTypeName<(typeof obj)["__typename"]>)
        : "id" in obj && obj.id === user.id
        ? "User"
        : "contactUserID" in obj
        ? "Contact"
        : null;
    },
  },
};

type UserOrContactTypeName<T> = T extends "User" ? "User" : T extends "Contact" ? "Contact" : never;
