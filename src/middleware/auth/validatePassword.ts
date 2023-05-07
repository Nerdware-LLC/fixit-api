import { catchAsyncMW, passwordHasher, AuthError } from "@utils";
import type { UserType } from "@types";

export const validatePassword = catchAsyncMW(async (req, res, next) => {
  if (!req?._user) next("User not found");

  // Cast type to UserType, TS not recognizing that "req._user" can't be undefined after above if-clause.
  req._user = req._user as UserType;

  if (req._user.login.type === "LOCAL") {
    const validPassword = await passwordHasher.validate(
      req.body.password,
      req._user.login.passwordHash
    );

    if (!validPassword) next(new AuthError("Invalid email or password"));
  }

  next();
});
