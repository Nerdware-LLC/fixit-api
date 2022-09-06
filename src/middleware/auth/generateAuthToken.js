import { AuthToken } from "@utils";

export const generateAuthToken = (req, res, next) => {
  if (!req?._user) next("User not found");

  try {
    const token = new AuthToken(req._user);
    res.json({
      token: token.toString(),
      ...(!!req._userQueryItems && { queryItems: req._userQueryItems })
    });
  } catch (error) {
    next(error);
  }
};
