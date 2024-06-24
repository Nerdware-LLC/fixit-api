import { sanitizeHandle, isValidHandle } from "@nerdware/ts-string-helpers";
import { isSafeInteger } from "@nerdware/ts-type-safety-utils";
import { usersCache, type UsersCacheEntry } from "@/lib/cache/usersCache.js";
import { UserInputError } from "@/utils/httpErrors.js";
import type { ContactItem } from "@/models/Contact";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  Query: {
    getUserByHandle: (_parent, { handle }) => {
      // Sanitize and validate the provided handle
      handle = sanitizeHandle(handle);
      if (!isValidHandle(handle)) throw new UserInputError(`Invalid value for field: "handle"`);

      const cachedUser = usersCache.get(handle);

      if (!cachedUser) throw new UserInputError("User not found.");

      return cachedUser;
    },
    searchForUsersByHandle: (
      _parent,
      { handle: handleArg, limit, offset: startIndex },
      { user: authenticatedUser }
    ) => {
      // Sanitize and validate the provided handle, limit, and offset
      handleArg = sanitizeHandle(handleArg);
      if (!isValidHandle(handleArg)) throw new UserInputError(`Invalid value for field: "handle"`);
      if (!isSafeInteger(limit) || limit < 0)
        throw new UserInputError(`Invalid value for field: "limit"`);
      if (!isSafeInteger(startIndex) || startIndex < 0)
        throw new UserInputError(`Invalid value for field: "offset"`);

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
