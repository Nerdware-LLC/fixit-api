import { googleTokenLogin } from "./googleTokenLogin.js";
import { login } from "./login.js";
import { passwordReset } from "./passwordReset.js";
import { pwResetInit } from "./passwordResetInit.js";
import { refreshAuthToken } from "./refreshAuthToken.js";
import { registerNewUser } from "./registerNewUser.js";

/**
 * This object contains request/response handlers for `/api/auth/*` routes.
 */
export const AuthController = {
  googleTokenLogin,
  login,
  pwResetInit,
  passwordReset,
  refreshAuthToken,
  registerNewUser,
} as const;
