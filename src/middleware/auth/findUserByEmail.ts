import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { User } from "@/models/User";
import type { RestApiRequestBodyByPath } from "@/types/open-api";

/**
 * This middleware simply queries the DB for a User with the given email address.
 */
export const findUserByEmail = mwAsyncCatchWrapper<
  RestApiRequestBodyByPath["/auth/register" | "/auth/login"]
>(async (req, res, next) => {
  const [user] = await User.query({
    where: { email: req.body.email },
    limit: 1,
  });

  res.locals.user = user;

  next();
});
