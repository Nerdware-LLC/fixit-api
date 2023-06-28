import { mwAsyncCatchWrapper } from "@middleware/helpers";
import { User } from "@models/User";

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
