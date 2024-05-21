import { sanitizeHex } from "@nerdware/ts-string-helpers";
import { getRequestBodySanitizer, type FieldConfig } from "@/controllers/_helpers";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { AuthService } from "@/services/AuthService";
import { LOGIN_CREDENTIALS_REQ_BODY_SCHEMA } from "./_common.js";
import type { ApiController } from "@/controllers/types.js";

/**
 * This controller method completes the password reset process for a user.
 *
 * > Endpoint: `POST /api/auth/password-reset`
 */
export const passwordReset: ApiController<"/auth/password-reset"> = async (req, res, next) => {
  try {
    const { password, passwordResetToken } = sanitizePasswordResetRequest(req);

    await AuthService.resetPassword({ password, passwordResetToken });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const sanitizePasswordResetRequest = getRequestBodySanitizer<"/auth/password-reset">({
  requestBodySchema: {
    password: {
      ...LOGIN_CREDENTIALS_REQ_BODY_SCHEMA.password,
      required: true,
    } as FieldConfig<string>,
    passwordResetToken: {
      type: "string",
      required: true,
      nullable: false,
      sanitize: sanitizeHex,
      validate: PasswordResetToken.isRawTokenProperlyEncoded,
    },
  },
});
