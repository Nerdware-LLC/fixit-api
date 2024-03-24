import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { Profile } from "@/models/Profile/Profile.js";
import { User } from "@/models/User/User.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";
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
      phone = null,
      expoPushToken, // Only mobile-app logins will have this
      password, //      Only local logins will have this
    },
  } = req;

  // For Google OAuth logins, get fields from the relevant res.locals object:
  const { googleID, profile: profileParams } = res.locals.googleIDTokenFields ?? {};

  // Set the authenticatedUser res.locals field used by `generateAuthToken`
  res.locals.authenticatedUser = await User.createOne({
    handle,
    email,
    phone,
    ...(expoPushToken && { expoPushToken }),
    ...(profileParams && { profile: Profile.fromParams(profileParams) }),
    password,
    googleID,
  });

  /* Data from this endpoint is returned to the sending client, so there's
  no need to limit visibility of attributes via "ProjectionExpression" in
  the above call to User.create, which uses the DynamoDB PutItem command.*/

  next();
});
