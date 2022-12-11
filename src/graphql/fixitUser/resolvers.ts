import type { Resolvers } from "@/types/graphql";

export const resolvers: Partial<Resolvers> = {
  FixitUser: {
    __resolveType: (obj) => {
      const { __typename = null } = obj as any; // FIXME

      return __typename || null;
    }
  }
};
