import { User, type UserItem } from "@/models/User";
import { AuthError, InternalServerError } from "@/utils/httpErrors.js";
import { passwordHasher } from "@/utils/passwordHasher.js";
import type { LoginParams } from "@/models/UserLogin";

/**
 * ### AuthService: authenticateUserViaLoginCredentials
 *
 * This function is used to authenticate a user via login credentials.
 * @returns The authenticated UserItem.
 */
export const authenticateUserViaLoginCredentials = async ({
  email,
  password,
  googleID,
}: Pick<UserItem, "email"> & Partial<LoginParams>): Promise<UserItem> => {
  // Ensure the user exists
  const [user] = await User.query({ where: { email }, limit: 1 });

  if (!user) throw new AuthError("User not found");

  // Check login type
  if (user.login.type === "LOCAL" && user.login.passwordHash) {
    // Ensure password was provided
    if (!password) throw new AuthError(ERR_MSG_USE_DIFFERENT_LOGIN_METHOD);
    // Validate the password
    const isValidPassword = await passwordHasher.validate(password, user.login.passwordHash);
    if (!isValidPassword) throw new AuthError("Invalid email or password");
    //
  } else if (user.login.type === "GOOGLE_OAUTH" && user.login.googleID) {
    // Ensure googleIDToken was provided
    if (!googleID) throw new AuthError(ERR_MSG_USE_DIFFERENT_LOGIN_METHOD);
    // Validate the googleID
    const isValidGoogleIDToken = googleID === user.login.googleID;
    if (!isValidGoogleIDToken) throw new AuthError("Invalid OAuth credentials");
    //
  } else {
    // Future proofing: if the login type is not yet handled, throw an error
    throw new InternalServerError("Invalid login credentials");
  }

  return user;
};

const ERR_MSG_USE_DIFFERENT_LOGIN_METHOD =
  "Your account was created with a different login method. Please use that method to sign in.";
