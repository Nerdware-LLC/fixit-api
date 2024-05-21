import { getRequestBodySanitizer } from "@/controllers/_helpers";
import { AuthService } from "@/services/AuthService";
import { LOGIN_CREDENTIALS_REQ_BODY_SCHEMA } from "./_common.js";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller method begins the password reset process for a user.
 *
 * > Endpoint: `POST /api/auth/password-reset-init`
 */
export const pwResetInit: ApiController<"/auth/password-reset-init"> = async (req, res, next) => {
  try {
    const { email } = sanitizePasswordResetInitRequest(req);

    await AuthService.sendPasswordResetEmail({ email });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const sanitizePasswordResetInitRequest = getRequestBodySanitizer<"/auth/password-reset-init">({
  requestBodySchema: {
    email: LOGIN_CREDENTIALS_REQ_BODY_SCHEMA.email,
  },
});
