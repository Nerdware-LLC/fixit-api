import { eventEmitter } from "@/events/eventEmitter.js";
import { usersCache } from "@/lib/cache/usersCache.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { Profile, type CreateProfileParams } from "@/models/Profile";
import { User, type UserItem, type UserCreateItemParams } from "@/models/User";
import { UserLogin, type LoginParams } from "@/models/UserLogin";
import {
  UserStripeConnectAccount,
  type UserStripeConnectAccountItem,
} from "@/models/UserStripeConnectAccount";
import { UserSCAService } from "@/services/UserSCAService";
import { UserInputError } from "@/utils/httpErrors.js";
import { logger } from "@/utils/logger.js";
import type { UndefinedOnPartialDeep } from "type-fest";

export type RegisterNewUserParams = UndefinedOnPartialDeep<
  Pick<UserCreateItemParams, "handle" | "email" | "phone" | "expoPushToken"> & {
    profile: CreateProfileParams | undefined;
  } & LoginParams
>;

/**
 * ### UserService: registerNewUser
 *
 * @returns The newly created User and their Stripe Connect Account.
 */
export const registerNewUser = async ({
  handle,
  email,
  phone = null,
  profile,
  password,
  googleID,
  expoPushToken,
}: RegisterNewUserParams): Promise<
  UserItem & { stripeConnectAccount: UserStripeConnectAccountItem }
> => {
  // Ensure the user does not already exist
  const [user] = await User.query({ where: { email }, limit: 1 });

  if (user) {
    throw new UserInputError("An account already exists with the provided email address.");
  }

  // Create Profile object
  const newUserProfile = Profile.fromParams({ ...profile, handle });
  // Create UserLogin object
  const newUserLogin = await UserLogin.fromParams({ password, googleID });

  // Create Stripe Customer via Stripe API
  const { id: stripeCustomerID } = await stripe.customers.create({
    email,
    ...(phone && { phone }),
    ...(!!newUserProfile.displayName && { name: newUserProfile.displayName }),
  });

  // Vars to hold the db items created in the try block:
  let newUser: UserItem | undefined;
  let newUserStripeConnectAccount: UserStripeConnectAccountItem | undefined;

  try {
    // TODO Replace these separate db calls with a single transaction (TransactWriteItems)

    // Create User
    newUser = await User.createItem({
      handle,
      email,
      phone,
      ...(expoPushToken && { expoPushToken }),
      stripeCustomerID,
      profile: { ...newUserProfile },
      login: { ...newUserLogin },
    });

    // Create newUser's Stripe Connect Account
    newUserStripeConnectAccount = await UserSCAService.registerNewUserSCA({
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
      phone: newUser.phone ?? null,
      profile: newUser.profile,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });

    // Emit the new user event
    eventEmitter.emitNewUser(newUser);
    //
  } catch (error: unknown) {
    // TODO Add logic here to diminish logging verbosity if error was caused by invalid user input

    // Log the error, and delete the Stripe Customer on fail
    logger.error(error, "UserService.registerNewUser");

    // Delete the Stripe Customer:

    logger.stripe(
      `Failed to create User with email "${email}". Deleting Stripe Customer "${stripeCustomerID}"...`
    );

    await stripe.customers.del(stripeCustomerID);

    logger.stripe(`Deleted Stripe Customer "${stripeCustomerID}".`);

    // Delete the User, if it was created:
    if (newUser) {
      logger.info(`Deleting User "${newUser.id}" due to failed UserService.registerNewUser()...`);
      User.deleteItem({ id: newUser.id })
        .then(() => logger.info(`SUCCESS: Deleted User "${newUser!.id}"`))
        .catch(() => logger.error(`ERROR: FAILED TO DELETE User "${newUser!.id}"`));

      // Delete the UserStripeConnectAccount, if it was created:
      if (newUserStripeConnectAccount) {
        logger.info(`Deleting SCA of User "${newUser.id}" due to failed UserService.registerNewUser()...`); // prettier-ignore
        UserStripeConnectAccount.deleteItem({ userID: newUser.id })
          .then(() => logger.info(`SUCCESS: Deleted SCA of User "${newUser!.id}"`))
          .catch(() => logger.error(`ERROR: FAILED TO DELETE SCA of User "${newUser!.id}"`));
      }
    }

    // Re-throw to allow MW to handle the error sent to the user
    throw error;
  }

  // If no errors were thrown, return successfully created newUser and SCA
  return {
    ...newUser,
    stripeConnectAccount: newUserStripeConnectAccount,
  };
};
