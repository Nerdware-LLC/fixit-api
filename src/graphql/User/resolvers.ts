import { usersCache } from "@lib/cache";
import { User } from "@models/User";
import type { Resolvers, Contact } from "@types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    user: async (parent, args, { user }) => {
      return await User.getUserByID(user.id);
    },
    getUserByHandle: (parent, { handle }) => {
      return usersCache.get(handle) ?? (null as any);
      // TODO above any-cast can be rm'd once old non-codegen types are
      // only used for db-facing code (i.e. models, resolvers, etc.)
    },
    searchForUsersByHandle: (parent, { handle: handleArg, limit, offset: startIndex }) => {
      limit = Math.max(10, Math.min(limit ?? 10, 50)); // limit must be between 10 and 50
      startIndex = Math.max(0, startIndex ?? 0); // startIndex must be >= 0

      const userCacheEntriesToSearch = usersCache.entries()?.slice(startIndex) ?? [];
      const matchingUsers = [];

      // Why not use reduce? Because we want to break out of the loop once we've found enough matches.
      for (let i = 0; i < userCacheEntriesToSearch.length; i++) {
        if (matchingUsers.length >= limit) break;

        const [userHandle, userPublicFields] = userCacheEntriesToSearch[i];

        if (userHandle.startsWith(handleArg)) matchingUsers.push(userPublicFields);
      }

      return matchingUsers as any; // TODO this any-cast can be rm'd once codegen types aren't mapped to old db-facing types like ContactType
    },
  },
};
