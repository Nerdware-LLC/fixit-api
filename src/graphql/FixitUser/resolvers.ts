import type { Resolvers } from "@/types";

export const resolvers: Partial<Resolvers> = {
  FixitUser: {
    __resolveType: (obj): "User" | "Contact" => {
      return "__typename" in obj
        ? (obj.__typename as "User" | "Contact")
        : "id" in obj && obj.id.startsWith("CONTACT#")
          ? "Contact"
          : "User";
    },
  },
};
