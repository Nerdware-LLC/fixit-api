import { usersCache } from "@lib/cache";
import { Contact } from "@models/Contact";
import { User, type UserModelItem } from "@models/User";
import type { FixitUser, Contact as GqlContact } from "@types";
import type { FixitApiAuthTokenPayload } from "@utils";
import type { SetOptional } from "type-fest";

/**
 * This function is used to get `FixitUser` objects for fields like
 * `createdBy`/`assignedTo` on `WorkOrder`s and `Invoice`s.
 *
 * > The `handle` field is optional since some internal-db types
 *   may return `createdBy`/`assignedTo` fields with only an `id`.
 */
export const getFixitUser = async (
  {
    id: itemUserID,
    handle: itemUserHandle,
  }: SetOptional<Pick<FixitUser, "id" | "handle">, "handle">,
  userAuthToken: FixitApiAuthTokenPayload
): Promise<FixitUserWithTypename> => {
  let fixitUser: FixitUserWithTypename;

  // If auth'd user is the FixitUser, use authToken fields
  if (itemUserID === userAuthToken.id) {
    fixitUser = {
      __typename: "User",
      id: userAuthToken.id,
      handle: userAuthToken.handle,
      email: userAuthToken.email,
      phone: userAuthToken.phone,
      profile: userAuthToken.profile,
      createdAt: userAuthToken.createdAt,
      updatedAt: userAuthToken.updatedAt,
    };
  } else if (!!itemUserHandle && usersCache.has(itemUserHandle)) {
    // Else check the usersCache
    fixitUser = {
      __typename: "Contact",
      ...(usersCache.get(itemUserHandle) as GqlContact),
    };
  } else {
    // Else get the FixitUser from the DB as a last resort
    const queriedUser = (await User.getItem({
      id: itemUserID,
      sk: User.getFormattedSK(itemUserID),
    })) as UserModelItem;

    fixitUser = {
      __typename: "Contact",
      id: Contact.getFormattedID(itemUserID),
      handle: queriedUser.handle,
      email: queriedUser.email,
      phone: queriedUser.phone,
      profile: queriedUser.profile,
      createdAt: queriedUser.createdAt,
      updatedAt: queriedUser.updatedAt,
    };
  }

  return fixitUser;
};

type FixitUserWithTypename = FixitUser & { __typename: "User" | "Contact" };
