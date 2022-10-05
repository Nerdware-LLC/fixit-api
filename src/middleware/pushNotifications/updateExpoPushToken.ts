import { User, type UserType } from "@models/User";
import { catchAsyncMW } from "@utils/middlewareWrappers";

export const updateExpoPushToken = catchAsyncMW(async (req, res, next) => {
  if (!req?._user) next("User not found");

  const {
    body: { expoPushToken },
    _user: { id: userID }
  } = req as { body: { expoPushToken?: string }; _user: UserType };

  if (expoPushToken) {
    await User.updateItem({ id: userID, sk: `#DATA#${userID}` }, { expoPushToken });
  }

  next();
});
