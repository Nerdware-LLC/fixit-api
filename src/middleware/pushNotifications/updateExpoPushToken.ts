import { mwAsyncCatchWrapper } from "@middleware/helpers";
import { User } from "@models/User";

export const updateExpoPushToken = mwAsyncCatchWrapper<{ body: { expoPushToken?: string } }>(
  async (req, res, next) => {
    if (!req?._authenticatedUser) return next("User not found");

    const {
      body: { expoPushToken },
      _authenticatedUser: { id: userID },
    } = req;

    if (expoPushToken) {
      await User.updateItem({ id: userID, sk: User.getFormattedSK(userID) }, { expoPushToken });
    }

    next();
  }
);
