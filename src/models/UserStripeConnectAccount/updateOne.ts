import type { Model } from "@lib/dynamoDB";
import type { UserStripeConnectAccountType, UserStripeConnectAccountMutableFields } from "@types";

// function, not arrow, bc we need "this" to be the UserStripeConnectAccount model
export const updateOne = async function (
  this: InstanceType<typeof Model>,
  existingUserStripeConnectAccount: {
    userID: UserStripeConnectAccountType["userID"];
  },
  mutableFieldsToUpdate: UserStripeConnectAccountMutableFields
) {
  // Update UserStripeConnectAccount in DynamoDB
  return await this.updateItem(
    {
      userID: existingUserStripeConnectAccount.userID,
      sk: `STRIPE_CONNECT_ACCOUNT#${existingUserStripeConnectAccount.userID}`,
    },
    mutableFieldsToUpdate // <-- detailsSubmitted, chargesEnabled, and/or payoutsEnabled
  );
};
