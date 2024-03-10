import { usersCache } from "@/lib/cache/usersCache.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { Profile } from "@/models/Profile/Profile.js";
import { UserLogin, type CreateLoginParams } from "@/models/UserLogin/UserLogin.js";
import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountItem,
} from "@/models/UserStripeConnectAccount/UserStripeConnectAccount.js";
import { logger } from "@/utils/logger.js";
import type { UserItem, User } from "@/models/User/User.js";
import type { Simplify, SetOptional } from "type-fest";

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
  let newUser: UserItem;
  let newUserStripeConnectAccount: UserStripeConnectAccountItem;

  // Create Profile object
  const newUserProfile = Profile.fromParams({ handle, ...(profile ?? {}) });

  // Create Stripe Customer via Stripe API
  const { id: stripeCustomerID } = await stripe.customers.create({
    email,
    phone,
    ...(newUserProfile.displayName.length > 0 && { name: newUserProfile.displayName }),
  });

  // Var the catch block can use to "undo" created resources if an error is thrown:
  let newUserID: string | undefined;
  let wasUserScaCreated = false;

  try {
    // Create User
    newUser = await this.createItem({
      handle,
      email,
      phone,
      ...(expoPushToken && { expoPushToken }),
      stripeCustomerID,
      profile: { ...newUserProfile },
      login: await UserLogin.createLogin({ password, googleID, googleAccessToken }),
    });

    newUserID = newUser.id;

    // Create newUser's Stripe Connect Account
    newUserStripeConnectAccount = await UserStripeConnectAccount.createOne({
      userID: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      profile: newUser.profile,
    });

    wasUserScaCreated = true;

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

    // Delete the Stripe Customer:

    logger.stripe(
      `Failed to create User with email "${email}". Deleting Stripe Customer "${stripeCustomerID}"...`
    );

    await stripe.customers.del(stripeCustomerID);

    logger.stripe(`Deleted Stripe Customer "${stripeCustomerID}".`);

    // Delete the User, if it was created:
    if (newUserID) {
      logger.info(`Deleting User "${newUserID}" due to failed User.createOne()...`);
      this.deleteItem({ id: newUserID })
        .then(() => logger.info(`SUCCESS: Deleted User "${newUserID}"`))
        .catch(() => logger.error(`ERROR: FAILED TO DELETE User "${newUserID}"`));

      // Delete the UserStripeConnectAccount, if it was created:
      if (wasUserScaCreated) {
        logger.info(`Deleting SCA of User "${newUserID}" due to failed User.createOne()...`);
        UserStripeConnectAccount.deleteItem({ userID: newUserID })
          .then(() => logger.info(`SUCCESS: Deleted SCA of User "${newUserID}"`))
          .catch(() => logger.error(`ERROR: FAILED TO DELETE SCA of User "${newUserID}"`));
      }
    }

    // Re-throw to allow MW to handle the error sent to the user
    throw error;
  }

  // If no error was thrown, newUser and SCA were created successfully
  return {
    ...newUser,
    stripeConnectAccount: newUserStripeConnectAccount,
  };
};

/** `User.createOne()` method params. */
export type UserCreateOneParams = Simplify<
  CreateLoginParams &
    SetOptional<
      Pick<UserItem, "handle" | "email" | "phone" | "expoPushToken" | "profile">,
      "profile"
    >
>;
