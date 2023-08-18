import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { User } from "@/models/User";
import type { UserCreateOneParams } from "@/models/User/createOne";

/**
 * This middleware function creates a new User item in the DB.
 *
 * > `req.originalUrl` = "/auth/register"
 */
export const registerNewUser = mwAsyncCatchWrapper<{ body: UserCreateOneParams }>(
  async (req, res, next) => {
    const {
      body: {
        handle,
        email,
        phone,
        expoPushToken, //     Only mobile-app logins will have this
        profile, //           Only Google OAuth logins will have this at reg time
        password, //          Only local logins will have this
        googleID, //          Only Google OAuth logins will have this
        googleAccessToken, // Only Google OAuth logins will have this
      },
    } = req;

    // req._authenticatedUser is the key expected by `generateAuthToken`
    req._authenticatedUser = await User.createOne({
      handle,
      email,
      phone,
      expoPushToken,
      password,
      profile,
      googleID,
      googleAccessToken,
    });

    /* Data from this endpoint is returned to the sending client, so there's
    no need to limit visibility of attributes via "ProjectionExpression" in
    the above call to User.create, which uses the DynamoDB PutItem command.*/

    next();
  }
);
