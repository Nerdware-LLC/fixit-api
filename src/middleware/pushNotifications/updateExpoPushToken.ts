import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { User } from "@/models/User";
import type { RestApiRequestBodyByPath } from "@/types/open-api";

/**
 * On the Fixit mobile app, if the user's ExpoPushToken has changed/expired
 * since the last login, the app will send the new one along with the request.
 * This middleware checks the request body for `expoPushToken`, and updates
 * the value in the database if one was provided.
 */
export const updateExpoPushToken = mwAsyncCatchWrapper<
  RestApiRequestBodyByPath["/auth/login" | "/auth/token"]
>(async (req, res, next) => {
  const { authenticatedUser } = res.locals;

  if (!authenticatedUser) return next("User not found");

  const { expoPushToken } = req.body;

  if (expoPushToken) {
    await User.updateItem({ id: authenticatedUser.id }, { update: { expoPushToken } });
  }

  next();
});
