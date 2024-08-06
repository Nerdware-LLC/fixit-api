import { User, type UserItem } from "@/models/User";
import { UserSCAService } from "@/services/UserSCAService";
import { UserService } from "@/services/UserService";
import { UserSubscriptionService } from "@/services/UserSubscriptionService";
import type { UserStripeConnectAccountItem } from "@/models/UserStripeConnectAccount";
import type { UserSubscriptionItem } from "@/models/UserSubscription";
import type { PreFetchedUserItems } from "@/types/open-api.js";

/**
 * ### AuthService: preFetchAndSyncUserItems
 *
 * This function is used to pre-fetch User items after authenticating a user login.
 * The following items are also updated/synced:
 *
 * - User["expoPushToken"] is updated if one is provided
 * - UserStripeConnectAccount data is updated from Stripe
 * - UserSubscription data is updated from Stripe
 *
 * @returns Up-to-date User items for the authenticated User's AuthToken payload.
 */
export const preFetchAndSyncUserItems = async ({
  authenticatedUserID,
  expoPushToken,
}: {
  authenticatedUserID: UserItem["id"];
  expoPushToken?: UserItem["expoPushToken"];
}): Promise<{
  userItems: PreFetchedUserItems;
  userStripeConnectAccount: UserStripeConnectAccountItem;
  userSubscription: UserSubscriptionItem | null;
}> => {
  // If the user has provided a new ExpoPushToken, update it in the db:
  if (expoPushToken)
    await User.updateItem({ id: authenticatedUserID }, { update: { expoPushToken } });

  // Pre-fetch User items
  const { userItems, userStripeConnectAccount, userSubscription } =
    await UserService.queryUserItems({ authenticatedUserID });

  // Get up-to-date StripeConnectAccount data from Stripe
  const upToDateStripeConnectAccount =
    await UserSCAService.refreshDataFromStripe(userStripeConnectAccount);

  // Get up-to-date Subscription data from Stripe
  const upToDateSubscription = userSubscription
    ? await UserSubscriptionService.refreshDataFromStripe(userSubscription)
    : null;

  return {
    userItems,
    userStripeConnectAccount: upToDateStripeConnectAccount,
    userSubscription: upToDateSubscription,
  };
};
