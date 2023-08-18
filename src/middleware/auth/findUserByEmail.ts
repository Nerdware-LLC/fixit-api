import { mwAsyncCatchWrapper } from "@/middleware/helpers";
import { User } from "@/models/User";

/**
 * This middleware simply queries the DB for a User with the given email address.
 */
export const findUserByEmail = mwAsyncCatchWrapper<{ body: { email: string } }>(
  async (req, res, next) => {
    const [user] = await User.query({
      where: { email: req.body.email },
      limit: 1,
    });

    req._user = user;

    next();
  }
);
