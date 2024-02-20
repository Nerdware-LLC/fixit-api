import { stripe } from "@/lib/stripe";
import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { UserSubscription } from "@/models/UserSubscription";

/**
 * This middleware checks if the User is authenticated, and if so, queries Stripe for
 * up-to-date subscription info. It then checks if the subscription's `status` and
 * `currentPeriodEnd` details from Stripe match those present in the auth token payload.
 * If they do not match, the UserSubscription item is updated in the db, and the User's
 * auth token payload values are updated as well.
 */
export const checkSubscriptionStatus = mwAsyncCatchWrapper(async (req, res, next) => {
  if (!res.locals?.authenticatedUser) return next("User not found");

  const { subscription, id: userID } = res.locals.authenticatedUser;

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
      /* Do NOT use Stripe's `createdAt` value for the UserSubscription SK, because it may
      not match the value in the DB. Instead, use the value from res.locals.userSubscription
      (should always be present here). */
      if (!res.locals?.userSubscription?.createdAt) return next("Invalid subscription details");

      const updatedSub = await UserSubscription.updateItem(
        {
          userID,
          sk: UserSubscription.getFormattedSK(userID, res.locals.userSubscription.createdAt),
        },
        {
          update: {
            status: upToDateSubInfo.status,
            currentPeriodEnd: upToDateSubInfo.currentPeriodEnd,
          },
        }
      );

      res.locals.authenticatedUser.subscription = {
        ...res.locals.authenticatedUser.subscription,
        ...updatedSub,
      };
    }
  }

  next();
});
