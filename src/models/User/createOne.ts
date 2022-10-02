import { stripe } from "@lib/stripe";
import { UserStripeConnectAccount } from "@models/UserStripeConnectAccount";
import { getUnixTimestampUUID, passwordHasher, logger } from "@utils";
import type { Model } from "@lib/dynamoDB";
import type { UserType } from "./types";

// function, not arrow, bc we need to use "this." syntax to call Dynamoose methods
export const createOne = async function (
  this: InstanceType<typeof Model>,
  {
    email,
    phone,
    expoPushToken,
    profile, //          Only Google logins will have this at reg time
    password, //         Only local logins will have this
    googleID, //         Only Google logins will have this
    googleAccessToken // Only Google logins will have this
  }: {
    email: string;
    phone: string;
    expoPushToken: string;
    profile?: UserType["profile"]; //      Only Google logins will have this at reg time
    password?: string; //          Only local logins will have this
    googleID?: string; //          Only Google logins will have this
    googleAccessToken?: string; // Only Google logins will have this
  }
) {
  let newUser;

  // Create Stripe Customer via Stripe API
  const { id: stripeCustomerID } = await stripe.customers.create({
    email,
    phone,
    ...(!!profile && // provide "name" if profile includes least 1 name property value
      Object.entries(profile).filter(([k, v]) => k !== "photoUrl" && !!v).length > 0 && {
        name: profile?.businessName
          ? profile.businessName
          : !!profile?.givenName && !!profile?.familyName
          ? `${profile.givenName} ${profile.familyName}`
          : profile?.givenName ?? profile.familyName
      })
  });

  // The new Stripe Customer obj should be deleted if user creation fails, so try-catch.

  try {
    /* Create User via model.create, which unlike item.save will not
    overwrite an existing item. newUser is re-assigned to the return
    value to capture "createdAt" and "updatedAt" generated fields.*/
    newUser = await this.createItem({
      id: `USER#${getUnixTimestampUUID()}`,
      email,
      phone,
      expoPushToken,
      stripeCustomerID,
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
      },
      ...(!!profile && { profile })
    });

    // Create Stripe Connect Account
    await UserStripeConnectAccount.createOne({
      userID: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      profile: newUser?.profile
    });
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

  return newUser as UserType;
};
