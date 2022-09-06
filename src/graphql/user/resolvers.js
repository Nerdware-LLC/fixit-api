import { User } from "@models/User";

export const resolvers = {
  Query: {
    user: async (parent, args, { user }) => {
      return await User.getUserByID(user.id);
    }
  }
};
