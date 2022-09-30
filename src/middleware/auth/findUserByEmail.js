import { User } from "@models/User";
import { catchAsyncMW } from "@utils/middlewareWrappers";

export const findUserByEmail = catchAsyncMW(async (req, res, next) => {
  const user = await User.queryUserByEmail(req.body.email);

  req._user = {
    ...user,
    id: user.pk // TODO rm this if Dynamoose "map" does this for us
  };

  next();
});
