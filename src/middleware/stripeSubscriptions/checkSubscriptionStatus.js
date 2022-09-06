import { stripe } from "@lib/stripe";
import { UserSubscription } from "@models/UserSubscription";
import { catchAsyncMW } from "@utils/middlewareWrappers";

export const checkSubscriptionStatus = catchAsyncMW(async (req, res, next) => {
  const { subscription, id: userID } = req._user;

  if (subscription) {
    const {
      id: subID,
      status: status_inDB,
      currentPeriodEnd: currentPeriodEnd_inDB
    } = subscription;

    // Fetch fresh data from Stripe
    const stripeRetrieveSubResult = await stripe.subscriptions.retrieve(subID);

    // Normalize the object returned from Stripe
    const upToDateSubInfo = UserSubscription.normalizeStripeFields(stripeRetrieveSubResult);

    // If DB values are stale, update the user's sub in the db
    if (
      upToDateSubInfo.status !== status_inDB ||
      upToDateSubInfo.currentPeriodEnd !== currentPeriodEnd_inDB.getTime()
    ) {
      const updatedSub = await UserSubscription.update(
        {
          pk: userID,
          sk: `SUBSCRIPTION#${userID}#${upToDateSubInfo.createdAt}`
        },
        {
          status: upToDateSubInfo.status,
          currentPeriodEnd: upToDateSubInfo.currentPeriodEnd
        }
      );

      req._user.subscription = updatedSub;
    }
  }

  next();
});
