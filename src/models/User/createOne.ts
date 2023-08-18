import { usersCache } from "@/lib/cache";
import { stripe } from "@/lib/stripe";
import { Profile } from "@/models/Profile";
import { UserLogin, type CreateLoginParams } from "@/models/UserLogin";
import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountModelItem,
} from "@/models/UserStripeConnectAccount";
import { normalize, logger } from "@/utils";
import type { UserModelItem, User } from "@/models/User";
import type { SetOptional } from "type-fest";

/**
 * `User.createOne` creates the following items:
 * - `User` (created in the DB)
 * - `UserStripeConnectAccount` (created in the DB AND Stripe's API)
 */
export const createOne = async function (
  this: typeof User,
  {
    handle,
    email,
    phone,
    expoPushToken, //     Only mobile users will have this
    profile, //           Only Google logins will have this at reg-time
    password, //          Only local logins will have this
    googleID, //          Only Google logins will have this
    googleAccessToken, // Only Google logins will have this
  }: UserCreateOneParams
) {
  let newUser: UserModelItem;
  let newUserStripeConnectAccount: UserStripeConnectAccountModelItem;

  // Create Profile object
  const newUserProfile = Profile.createProfile({ handle, ...(profile ?? {}) });

  // Create Stripe Customer via Stripe API
  const { id: stripeCustomerID } = await stripe.customers.create({
    email,
    phone: normalize.phone(phone), // <-- don't send non-digit chars to Stripe
    ...(newUserProfile.displayName.length > 0 && { name: newUserProfile.displayName }),
  });

  // The new Stripe Customer obj should be deleted if user creation fails, so try-catch.

  try {
    // Create User
    newUser = await this.createItem({
      handle,
      email,
      phone,
      expoPushToken,
      stripeCustomerID,
      profile: { ...newUserProfile },
      login: await UserLogin.createLogin({ password, googleID, googleAccessToken }),
    });

    // Create newUser's Stripe Connect Account
    newUserStripeConnectAccount = await UserStripeConnectAccount.createOne({
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

  // If no error was thrown, newUser and SCA were created successfully
  return {
    ...newUser,
    stripeConnectAccount: newUserStripeConnectAccount,
  };
};

/** The params for the User.createOne method. */
export type UserCreateOneParams = CreateLoginParams &
  SetOptional<
    Pick<UserModelItem, "handle" | "email" | "phone" | "expoPushToken" | "profile">,
    "profile"
  >;
