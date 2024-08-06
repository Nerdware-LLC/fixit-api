import { isString } from "@nerdware/ts-type-safety-utils";
import { pinpointClient } from "@/lib/pinpointClient";
import { SUBSCRIPTION_PRODUCT_NAMES } from "@/models/UserSubscription/enumConstants.js";
import { intToCurrencyStr } from "@/utils/formatters/currency.js";
import { capitalize } from "@/utils/formatters/strings.js";
import type { SubscriptionPriceName } from "@/types/graphql.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * Send confirmation email to User when `CheckoutCompleted` event is emitted.
 * @event CheckoutCompleted
 * @category events
 */
export const sendConfirmationEmail = async ({
  user,
  priceName,
  paymentIntentID,
  amountPaid,
}: CheckoutConfirmationData) => {
  if (!isString(amountPaid)) amountPaid = intToCurrencyStr(amountPaid);

  await pinpointClient.sendMessages({
    to: user.email,
    ChannelType: "EMAIL",
    TemplateConfiguration: {
      EmailTemplate: {
        Name: "checkout-confirmation-email",
      },
    },
    MessageConfiguration: {
      EmailMessage: {
        Substitutions: {
          productName: [
            `${SUBSCRIPTION_PRODUCT_NAMES.FIXIT_SUBSCRIPTION} (${capitalize(priceName)})`,
          ],
          paymentIntentID: [paymentIntentID ?? "N/A"],
          amountPaid: [amountPaid],
        },
      },
    },
  });
};

export type CheckoutConfirmationData = {
  user: AuthTokenPayload;
  priceName: SubscriptionPriceName;
  paymentIntentID: string | null | undefined;
  amountPaid: string | number;
};
