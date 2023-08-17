import { mwAsyncCatchWrapper } from "@middleware/helpers";
import { User } from "@models/User";

/**
 * On the Fixit mobile app, if the user's ExpoPushToken has changed/expired
 * since the last login, the app will send the new one along with the request.
 * This middleware checks the request body for `expoPushToken`, and updates
 * the value in the database if one was provided.
 */
export const updateExpoPushToken = mwAsyncCatchWrapper<{ body: { expoPushToken?: string } }>(
  async (req, res, next) => {
    if (!req?._authenticatedUser) return next("User not found");

    const {
      body: { expoPushToken },
      _authenticatedUser: { id: userID },
    } = req;

    if (expoPushToken) {
      await User.updateItem({ id: userID }, { expoPushToken });
    }

    next();
  }
);
