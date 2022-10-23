import { catchAsyncMW, AuthToken, AuthError } from "@utils";

export const getUserFromAuthHeaderToken = catchAsyncMW(async (req, res, next) => {
  req._user = await AuthToken.getValidatedRequestAuthTokenPayload(req).catch((err) => {
    throw new AuthError(err); // Re-throw as AuthError
  });

  next();
});
