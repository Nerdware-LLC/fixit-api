import { sanitizePassword, isValidPassword, sanitizeHex } from "@nerdware/ts-string-helpers";
import { z as zod } from "zod";
import { ApiController } from "@/controllers/ApiController.js";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { AuthService } from "@/services/AuthService";

/**
 * This controller method completes the password reset process for a user.
 *
 * > Endpoint: `POST /api/auth/password-reset`
 */
export const passwordReset = ApiController<"/auth/password-reset">(
  // Req body schema:
  zod
    .object({
      password: zod.string().transform(sanitizePassword).refine(isValidPassword),
      passwordResetToken: zod
        .string()
        .transform(sanitizeHex)
        .refine(PasswordResetToken.isRawTokenProperlyEncoded),
    })
    .strict(),
  // Controller logic:
  async (req, res) => {
    const { password, passwordResetToken } = req.body;

    await AuthService.resetPassword({ password, passwordResetToken });

    res.sendStatus(200);
  }
);
