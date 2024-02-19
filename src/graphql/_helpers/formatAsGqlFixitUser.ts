import { usersCache } from "@/lib/cache/usersCache";
import { contactModelHelpers } from "@/models/Contact/helpers";
import { User } from "@/models/User";
import type { FixitUser } from "@/types/graphql";
import type { FixitApiAuthTokenPayload } from "@/utils/AuthToken";
import type { SetOptional } from "type-fest";

/**
 * This function converts `Users`/`Contacts` from their internal database shape/format into the
 * GraphQL schema's `FixitUser` shape/format. This function is used in the `WorkOrder` and `Invoice`
 * resolvers to get the `createdBy`/`assignedTo` fields.
 */
export const formatAsGqlFixitUser = async (
  /**
   * The `User` or `Contact` data to format as a GQLFixitUser object. Note that the `handle` field
   * is optional since it isn't present on relational fields like the `createdBy` and `assignedTo`
   * fields of `WorkOrder` and `Invoice` items.
   */
  {
    id: itemUserID,
    handle: itemUserHandle,
  }: SetOptional<Pick<FixitUser, "id" | "handle">, "handle">,
  /**
   * The currently authenticated User's AuthToken is used to determine if the data in the first
   * param belongs to the currently authenticated User or not.
   */
  userAuthToken: FixitApiAuthTokenPayload
): Promise<FixitUser> => {
  let fixitUser: (FixitUser & Record<string, unknown>) | undefined;

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
  } else if (itemUserHandle) {
    // Else check usersCache if an itemUserHandle was provided
    const maybeUser = usersCache.get(itemUserHandle);

    if (maybeUser) {
      // Apply the data from the cache, formatting the UserID as a ContactID
      const { id: contactUserID, ...contactFields } = maybeUser;
      fixitUser = {
        __typename: "Contact",
        ...contactFields,
        id: contactModelHelpers.id.format(contactUserID),
      };
    }
  }

  // If neither of the above methods yielded data for FixitUser, get it from the DB as a last resort.
  if (!fixitUser) {
    const maybeUser = await User.getItem({ id: itemUserID });

    if (maybeUser) {
      fixitUser = {
        __typename: "Contact",
        ...maybeUser,
        id: contactModelHelpers.id.format(itemUserID),
      };
    }
  }

  // If for some reason there's still no data for FixitUser, throw an error.
  if (!fixitUser) throw new Error("User not found.");

  return fixitUser;
};
