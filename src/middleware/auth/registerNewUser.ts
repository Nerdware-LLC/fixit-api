import { User } from "@models/User";
import { catchAsyncMW } from "@utils/middlewareWrappers";

// req.originalUrl = "/auth/register"

export const registerNewUser = catchAsyncMW(async (req, res, next) => {
  const {
    body: {
      handle,
      email,
      phone,
      expoPushToken,
      password = null, //           Only local logins will have "password"
      profile = null, //            Only Google OAuth logins will have "profile" at reg time
      googleID = null, //           Only Google OAuth logins will have "googleID"
      googleAccessToken = null, //   Only Google OAuth logins will have "googleAccessToken"
    },
  } = req;

  req._user = await User.createOne({
    handle,
    email,
    phone,
    expoPushToken,
    password,
    profile,
    googleID,
    googleAccessToken,
  });

  /* Data from this endpoint is returned to the sending client, so there's no
  need to limit visibility of attributes (via "ProjectionExpression") in the
  above call to User.create, which uses the DynamoDB PutItem command.  */

  next();
});
