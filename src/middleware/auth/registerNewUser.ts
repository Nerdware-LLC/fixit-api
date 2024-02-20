import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";
import type { RestApiRequestBodyByPath } from "@/types/open-api";
import type { UnionToIntersection } from "type-fest";

/**
 * This middleware function creates a new User item in the DB.
 */
export const registerNewUser = mwAsyncCatchWrapper<
  UnionToIntersection<RestApiRequestBodyByPath["/auth/register"]>
>(async (req, res, next) => {
  const {
    body: {
      handle,
      email,
      phone,
      expoPushToken, //          Only mobile-app logins will have this
      profile: profileParams, // Only Google OAuth logins will have this at reg time
      password, //               Only local logins will have this
      googleID, //               Only Google OAuth logins will have this
      googleAccessToken, //      Only Google OAuth logins will have this
    },
  } = req;

  // Set the authenticatedUser res.locals field used by `generateAuthToken`
  res.locals.authenticatedUser = await User.createOne({
    handle,
    email,
    phone,
    ...(expoPushToken && { expoPushToken }),
    ...(profileParams && { profile: Profile.fromParams(profileParams) }),
    password,
    googleID,
    googleAccessToken,
  });

  /* Data from this endpoint is returned to the sending client, so there's
  no need to limit visibility of attributes via "ProjectionExpression" in
  the above call to User.create, which uses the DynamoDB PutItem command.*/

  next();
});
