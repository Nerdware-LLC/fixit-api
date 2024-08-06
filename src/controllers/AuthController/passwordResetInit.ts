import { sanitizeEmail, isValidEmail } from "@nerdware/ts-string-helpers";
import { z as zod } from "zod";
import { ApiController } from "@/controllers/ApiController.js";
import { AuthService } from "@/services/AuthService";

/**
 * This controller method begins the password reset process for a user.
 *
 * > Endpoint: `POST /api/auth/password-reset-init`
 */
export const pwResetInit = ApiController<"/auth/password-reset-init">(
  zod
    .object({
      email: zod.string().toLowerCase().transform(sanitizeEmail).refine(isValidEmail),
    })
    .strict(),
  async (req, res) => {
    const { email } = req.body;

    await AuthService.sendPasswordResetEmail({ email });

    res.sendStatus(200);
  }
);
