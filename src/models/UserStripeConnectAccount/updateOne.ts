import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountModelItem,
} from "@/models/UserStripeConnectAccount";
import { STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR as SK_PREFIX } from "@/models/UserStripeConnectAccount/regex";

/**
 * This method updates a `UserStripeConnectAccount` item in both the DB and
 * Stripe's API (via `stripe.accounts.create`).
 *
 * Note: this function does not use arrow syntax because `this` is the
 * UserStripeConnectAccount Model.
 */
export const updateOne = async function (
  this: typeof UserStripeConnectAccount,
  /** An existing UserStripeConnectAccount object */
  { userID }: Pick<UserStripeConnectAccountModelItem, "userID">,
  mutableFieldsToUpdate: Partial<
    Pick<
      UserStripeConnectAccountModelItem,
      "detailsSubmitted" | "chargesEnabled" | "payoutsEnabled"
    >
  >
) {
  // Update UserStripeConnectAccount in DynamoDB
  return await this.updateItem(
    { userID, sk: `${SK_PREFIX}#${userID}` },
    mutableFieldsToUpdate // <-- detailsSubmitted, chargesEnabled, and/or payoutsEnabled
  );
};
