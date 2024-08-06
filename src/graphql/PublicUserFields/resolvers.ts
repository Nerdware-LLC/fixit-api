import { CONTACT_SK_PREFIX_STR } from "@/models/Contact";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  PublicUserFields: {
    __resolveType: (obj): "User" | "Contact" => {
      return "__typename" in obj
        ? obj.__typename
        : obj.id.startsWith(CONTACT_SK_PREFIX_STR)
          ? "Contact"
          : "User";
    },
  },
};
