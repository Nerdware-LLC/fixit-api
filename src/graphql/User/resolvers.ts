import { usersCache } from "@/lib/cache";
import { User } from "@/models/User";
import { GqlInternalServerError } from "@/utils/httpErrors";
import type { Resolvers, Contact } from "@/types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    user: async (parent, args, { user }) => {
      const getItemResult = await User.getItem({ id: user.id });
      if (!getItemResult) throw new GqlInternalServerError("User not found.");
      return getItemResult;
    },
    getUserByHandle: (parent, { handle }) => {
      return usersCache.get(handle) ?? null;
    },
    searchForUsersByHandle: (parent, { handle: handleArg, limit, offset: startIndex }) => {
      limit = Math.max(10, Math.min(limit ?? 10, 50)); // limit must be between 10 and 50
      startIndex = Math.max(0, startIndex ?? 0); // startIndex must be >= 0

      const userCacheEntriesToSearch = usersCache.entries()?.slice(startIndex) ?? [];
      const matchingUsers: Array<Contact> = [];

      // Why not use reduce? Because we want to break out of the loop once we've found enough matches.
      for (let i = 0; i < userCacheEntriesToSearch.length; i++) {
        if (matchingUsers.length >= limit) break;

        const [userHandle, userPublicFields] = userCacheEntriesToSearch[i];

        if (userHandle.startsWith(handleArg)) matchingUsers.push(userPublicFields);
      }

      return matchingUsers;
    },
  },
};
