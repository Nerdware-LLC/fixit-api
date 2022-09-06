import { catchAsyncMW, passwordHasher, AuthError } from "@utils";

export const validatePassword = catchAsyncMW(async (req, res, next) => {
  if (req._user.login.type === "LOCAL") {
    const validPassword = await passwordHasher.validate(
      req.body.password,
      req._user.login.passwordHash
    );

    if (!validPassword) next(new AuthError("Invalid email or password"));
  }

  next();
});
