import { User } from "@models/User";
import { catchAsyncMW } from "@utils/middlewareWrappers";

export const updateExpoPushToken = catchAsyncMW(async (req, res, next) => {
  const {
    body: { expoPushToken },
    _user: { id: userID }
  } = req;

  if (expoPushToken) {
    await User.updateItem({ id: userID, sk: `#DATA#${userID}` }, { expoPushToken });
  }

  next();
});
