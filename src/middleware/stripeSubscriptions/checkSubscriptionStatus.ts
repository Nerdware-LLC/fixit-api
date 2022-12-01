import { stripe } from "@lib/stripe";
import { UserSubscription } from "@models/UserSubscription";
import { catchAsyncMW } from "@utils/middlewareWrappers";
import type { UserType, UserSubscriptionType } from "@models";

export const checkSubscriptionStatus = catchAsyncMW(async (req, res, next) => {
  if (!req?._user) next("User not found");

  const { subscription, id: userID } = req._user as UserType;

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
      upToDateSubInfo.currentPeriodEnd.getTime() !== new Date(currentPeriodEnd_inDB).getTime()
    ) {
      const updatedSub = await UserSubscription.updateItem(
        {
          userID,
          sk: `SUBSCRIPTION#${userID}#${upToDateSubInfo.createdAt}`
        },
        {
          status: upToDateSubInfo.status,
          currentPeriodEnd: upToDateSubInfo.currentPeriodEnd
        }
      );

      (req._user as UserType).subscription = updatedSub as UserSubscriptionType;
    }
  }

  next();
});
