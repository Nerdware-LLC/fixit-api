import { eventEmitter } from "@events";
import { stripe } from "@lib/stripe";
import { User, UserStripeConnectAccount } from "@models";
import { getUnixTimestampUUID, passwordHasher, logger } from "@utils";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function ({
  email,
  phone,
  expoPushToken,
  password = null, //         Only local logins will have this
  profile = null, //          Only Google logins will have this at reg time
  googleID = null, //         Only Google logins will have this
  googleAccessToken = null // Only Google logins will have this
}) {
  let newUser;
  /* Create User related Items in this order:

    stripeCustomer            (Stripe)
    User                      (DynamoDB)  Needs stripeCustomerID
    stripeConnectAccount
  */

  // Create Stripe Customer via Stripe API
  const { id: stripeCustomerID } = await stripe.customers.create({
    email,
    phone,
    name: !profile
      ? null
      : profile?.businessName
      ? profile.businessName
      : !!profile.givenName && !!profile.familyName
      ? `${profile.givenName} ${profile.familyName}`
      : null
  });

  // The new Stripe Customer obj should be deleted if user creation fails, so try-catch.

  try {
    /* Create User via model.create, which unlike item.save will not
    overwrite an existing item. newUser is re-assigned to the return
    value to capture "createdAt" and "updatedAt" generated fields.*/
    newUser = await this.create(
      new User({
        id: `USER#${getUnixTimestampUUID()}`,
        email,
        phone,
        expoPushToken,
        stripeCustomerID,
        profile,
        login: {
          ...(password && {
            type: "LOCAL", // For local email+pw logins
            passwordHash: await passwordHasher.getHash(password)
          }),
          ...(googleID && {
            type: "GOOGLE_OAUTH", // For Google OAuth logins
            googleID,
            googleAccessToken
          })
        }
      })
    );

    // Create Stripe Connect Account
    await UserStripeConnectAccount.createOne({
      ...newUser,
      userID: newUser.id
    });

    // Emit "newUser" event
    eventEmitter.emitNewUser(newUser);
  } catch (error) {
    // Log the error, and delete the Stripe Customer on fail
    logger.error(error, "User.createOne");

    logger.stripe(
      `Failed to create User with email "${email}". Attempting to delete Stripe Customer "${stripeCustomerID}"...`
    );

    const { deleted } = await stripe.customers.del(stripeCustomerID);

    logger.stripe(
      deleted === true
        ? `SUCCESS: Deleted Stripe Customer "${stripeCustomerID}"`
        : `ERROR: FAILED TO DELETE Stripe Customer "${stripeCustomerID}"`
    );

    // Re-throw to allow MW to handle the error sent to the user
    throw error;
  }

  return newUser;
};
