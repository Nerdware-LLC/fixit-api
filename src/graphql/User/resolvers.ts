import { usersCache, type UsersCacheEntry } from "@/lib/cache/usersCache";
import { User } from "@/models/User";
import { GqlUserInputError, GqlInternalServerError } from "@/utils/httpErrors";
import type { ContactItem } from "@/models/Contact";
import type { Resolvers } from "@/types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    user: async (_parent, _args, { user }) => {
      const result = await User.getItem({ id: user.id });

      if (!result) throw new GqlInternalServerError("User not found.");

      return result;
    },
    getUserByHandle: (_parent, { handle }, { user: authenticatedUser }) => {
      const cachedUser = usersCache.get(handle);

      if (!cachedUser) throw new GqlUserInputError("User not found.");

      return {
        ...cachedUser,
        userID: authenticatedUser.id,
        contactUserID: cachedUser.id,
      };
    },
    searchForUsersByHandle: (
      _parent,
      { handle: handleArg, limit, offset: startIndex },
      { user: authenticatedUser }
    ) => {
      limit = Math.max(10, Math.min(limit ?? 10, 50)); // limit must be between 10 and 50
      startIndex = Math.max(0, startIndex ?? 0); // startIndex must be >= 0

      const userCacheEntriesToSearch = usersCache.entries()?.slice(startIndex) ?? [];
      const matchingUsers: Array<ContactItem> = [];

      // Why not use reduce? Because we want to break out of the loop once we've found enough matches.
      for (let i = 0; i < userCacheEntriesToSearch.length; i++) {
        if (matchingUsers.length >= limit) break;

        const [userHandle, userPublicFields] = userCacheEntriesToSearch[i] as UsersCacheEntry;

        if (userHandle.startsWith(handleArg)) {
          matchingUsers.push({
            ...userPublicFields,
            userID: authenticatedUser.id,
            contactUserID: userPublicFields.id,
          });
        }
      }

      return matchingUsers;
    },
  },
};
