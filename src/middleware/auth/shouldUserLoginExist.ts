import { ClientInputError, AuthError, type MiddlewareFn } from "@utils";

// req.path = "/register"
export const userLoginShouldNotExist: MiddlewareFn = (req, res, next) => {
  if (req?._user?.login) next(new ClientInputError("User already registered"));
  next();
};

// req.path = "/login"
export const userLoginShouldExist: MiddlewareFn = (req, res, next) => {
  if (!req?._user?.login) next(new AuthError("User not found"));
  next();
};
