import { usersCache } from "@lib/cache";
import { stripe } from "@lib/stripe";
import { Profile } from "@models/Profile";
import { UserStripeConnectAccount } from "@models/UserStripeConnectAccount";
import { getUnixTimestampUUID, normalizeInput, passwordHasher, logger } from "@utils";
import type { Model } from "@lib/dynamoDB";
import type { UserType } from "@types";
import type { Simplify } from "type-fest";

// function, not arrow, bc we need "this" to be the User model
export const createOne = async function (
  this: InstanceType<typeof Model>,
  {
    handle,
    email,
    phone,
    expoPushToken, //    Only mobile users will have this
    profile, //          Only Google logins will have this at reg time
    password, //         Only local logins will have this
    googleID, //         Only Google logins will have this
    googleAccessToken, // Only Google logins will have this
  }: {
    handle: string;
    email: string;
    phone: string;
    expoPushToken?: string; //        Only mobile users will have this
    profile?: UserType["profile"]; // Only Google logins will have this at reg time
    password?: string; //             Only local logins will have this
    googleID?: string; //             Only Google logins will have this
    googleAccessToken?: string; //    Only Google logins will have this
  }
) {
  let newUser: Simplify<UserType & { sk: string }>;

  // Create Stripe Customer via Stripe API
  const { id: stripeCustomerID } = await stripe.customers.create({
    email,
    phone: normalizeInput.phone(phone), // <-- don't send non-digit chars to Stripe
    ...(!!profile && // provide "name" if profile includes least 1 name property value
      Object.entries(profile).filter(([k, v]) => k !== "photoUrl" && !!v).length > 0 && {
        name: profile?.businessName
          ? profile.businessName
          : profile?.givenName
          ? `${profile.givenName}${profile?.familyName ? ` ${profile.familyName}` : ""}`
          : profile.familyName,
      }),
  });

  // The new Stripe Customer obj should be deleted if user creation fails, so try-catch.

  try {
    // Create User
    newUser = await this.createItem({
      id: `USER#${getUnixTimestampUUID()}`,
      handle,
      email,
      phone,
      expoPushToken,
      stripeCustomerID,
      login: {
        ...(password && {
          type: "LOCAL", // For local email+pw logins
          passwordHash: await passwordHasher.getHash(password),
        }),
        ...(googleID && {
          type: "GOOGLE_OAUTH", // For Google OAuth logins
          googleID,
          googleAccessToken,
        }),
      },
      profile: new Profile({ handle, ...(profile ?? {}) }),
    });

    // Create newUser's Stripe Connect Account
    newUser.stripeConnectAccount = await UserStripeConnectAccount.createOne({
      userID: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      profile: newUser.profile,
    });

    // Add newUser to usersCache for search-by-handle
    usersCache.set(newUser.handle, {
      id: newUser.id,
      handle: newUser.handle,
      email: newUser.email,
      phone: newUser.phone,
      profile: newUser.profile,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
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

  return newUser;
};
