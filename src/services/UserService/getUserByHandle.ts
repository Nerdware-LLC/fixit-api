import { usersCache } from "@/lib/cache/usersCache.js";
import { User, userModelHelpers } from "@/models/User";
import type { User as GqlUser } from "@/types/graphql.js";

/**
 * ### UserService: getUserByHandle
 */
export const getUserByHandle = async ({ handle }: { handle: string }): Promise<GqlUser> => {
  // Check usersCache
  let publicUser: GqlUser | undefined = usersCache.get(handle);

  // If neither of the above methods yielded data for publicUser, get it from the DB as a last resort.
  if (!publicUser) {
    publicUser = await User.getItem({
      id: userModelHelpers.id.format(handle),
    });

    // If we found a user, cache it for future use.
    if (publicUser) usersCache.set(publicUser.handle, publicUser);
  }

  // If for some reason there's still no data for publicUser, throw an error.
  if (!publicUser) throw new Error("User not found.");

  return publicUser;
};
