import { catchAsyncMW, AuthToken, AuthError } from "@utils";

export const getUserFromAuthHeaderToken = catchAsyncMW(async (req, res, next) => {
  const authTokenPayload = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch((err) => {
    throw AuthError(err); // Re-throw as AuthError
  });

  req._user = {
    ...authTokenPayload
  };

  next();
});
