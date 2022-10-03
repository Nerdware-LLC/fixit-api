import { User, type UserType } from "@models/User";
import { catchAsyncMW } from "@utils/middlewareWrappers";

export const findUserByEmail = catchAsyncMW(async (req, res, next) => {
  req._user = (await User.queryUserByEmail(req.body.email)) as UserType;

  next();
});
