import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import { User } from "@/models/User/User.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";

/**
 * This middleware simply queries the DB for a User with the given email address.
 */
export const findUserByEmail = mwAsyncCatchWrapper<
  Pick<RestApiRequestBodyByPath["/auth/register" | "/auth/login"], "email">
>(async (req, res, next) => {
  const [user] = await User.query({
    where: { email: req.body.email },
    limit: 1,
  });

  res.locals.user = user;

  next();
});
