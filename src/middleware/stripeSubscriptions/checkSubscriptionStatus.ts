import { stripe } from "@lib/stripe";
import { mwAsyncCatchWrapper } from "@middleware/helpers";
import { UserSubscription } from "@models/UserSubscription";

export const checkSubscriptionStatus = mwAsyncCatchWrapper(async (req, res, next) => {
  if (!req?._authenticatedUser) return next("User not found");

  const { subscription, id: userID } = req._authenticatedUser;

  if (subscription) {
    const {
      id: subID,
      status: status_inDB,
      currentPeriodEnd: currentPeriodEnd_inDB,
    } = subscription;

    // Fetch fresh data from Stripe
    const stripeRetrieveSubResult = await stripe.subscriptions.retrieve(subID);

    // Normalize the object returned from Stripe
    const upToDateSubInfo = UserSubscription.normalizeStripeFields(stripeRetrieveSubResult);

    // If DB values are stale, update the user's sub in the db
    if (
      upToDateSubInfo.status !== status_inDB ||
      upToDateSubInfo.currentPeriodEnd.getTime() !== new Date(currentPeriodEnd_inDB).getTime()
    ) {
      /* Do NOT use Stripe's `createdAt` value for the Sub-SK, because it may not
      match the value in the DB. Instead, use the value from req._userSubscription
      (should always be present here).  */
      if (!req?._userSubscription?.createdAt) return next("Invalid subscription details");

      const updatedSub = await UserSubscription.updateItem(
        {
          userID,
          sk: UserSubscription.getFormattedSK(userID, req._userSubscription.createdAt),
        },
        {
          status: upToDateSubInfo.status,
          currentPeriodEnd: upToDateSubInfo.currentPeriodEnd,
        }
      );

      req._authenticatedUser.subscription = {
        ...req._authenticatedUser.subscription,
        ...updatedSub,
      };
    }
  }

  next();
});
