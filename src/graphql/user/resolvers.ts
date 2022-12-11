import { User } from "@models/User";
import type { Resolvers } from "@/types/graphql";

export const resolvers: Partial<Resolvers> = {
  Query: {
    user: async (parent, args, { user }) => {
      return await User.getUserByID(user.id);
    }
  }
};
