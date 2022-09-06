import { ClientInputError, AuthError } from "@utils";

// req.path = "/register"
export const userLoginShouldNotExist = (req, res, next) => {
  if (req?._user?.login) next(new ClientInputError("User already registered"));
  next();
};

// req.path = "/login"
export const userLoginShouldExist = (req, res, next) => {
  if (!req?.user?.login) next(new AuthError("User not found"));
  next();
};
