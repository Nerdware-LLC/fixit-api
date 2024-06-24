import { usersCache } from "@/lib/cache/usersCache.js";
import { User } from "@/models/User";
import type { User as GqlUser } from "@/types/graphql.js";

/**
 * ### UserService: getUserByHandleOrID
 */
export const getUserByHandleOrID = async ({
  id: userID,
  handle: userHandle,
}: {
  id: string;
  handle?: string | undefined;
}): Promise<GqlUser> => {
  let publicUser: GqlUser | undefined;

  // Else check usersCache if an itemUserHandle was provided
  if (userHandle) publicUser = usersCache.get(userHandle);

  // If neither of the above methods yielded data for publicUser, get it from the DB as a last resort.
  if (!publicUser) {
    publicUser = await User.getItem({ id: userID });
    // If we found a user, cache it for future use.
    if (publicUser) usersCache.set(publicUser.handle, publicUser);
  }

  // If for some reason there's still no data for publicUser, throw an error.
  if (!publicUser) throw new Error("User not found.");

  return publicUser;
};
