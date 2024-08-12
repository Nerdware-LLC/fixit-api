import {
  sanitizeHandle,
  isValidHandle,
  sanitizePhone,
  isValidPhone,
} from "@nerdware/ts-string-helpers";
import { hasKey } from "@nerdware/ts-type-safety-utils";
import { z as zod } from "zod";
import { ApiController } from "@/controllers/ApiController.js";
import { AuthService } from "@/services/AuthService";
import { UserService } from "@/services/UserService";
import { loginReqBodyZodSchema } from "./login.js";
import type { ParsedGoogleOAuth2IDTokenFields } from "@/services/AuthService/GoogleOAuth2IDToken.js";

/**
 * The Zod schema for the request body of the `/auth/register` endpoint.
 */
export const registerNewUserReqBodyZodSchema = loginReqBodyZodSchema
  .innerType()
  .extend({
    handle: zod.string().transform(sanitizeHandle).refine(isValidHandle),
    phone: zod
      .string()
      .nullish()
      .default(null)
      .transform((value) => (value ? sanitizePhone(value) : null))
      .refine((value) => (value ? isValidPhone(value) : value === null)),
  })
  .refine(
    // Require either a `password` or `googleIDToken`:
    (reqBody) => hasKey(reqBody, "password") || hasKey(reqBody, "googleIDToken"),
    { message: "Invalid login credentials" }
  );

/**
 * This controller method registers a new user.
 *
 * > Endpoint: `POST /api/auth/register`
 */
export const registerNewUser = ApiController<"/auth/register">(
  // Req body schema:
  registerNewUserReqBodyZodSchema,
  // Controller logic:
  async (req, res) => {
    const { handle, email, phone = null, password, googleIDToken, expoPushToken } = req.body;

    // If a `googleIDToken` is provided, parse it:
    const { googleID, profile }: Partial<ParsedGoogleOAuth2IDTokenFields> = googleIDToken
      ? await AuthService.parseGoogleOAuth2IDToken(googleIDToken)
      : {};

    // Register the new User:
    const newUser = await UserService.registerNewUser({
      handle,
      email,
      phone,
      password,
      googleID,
      profile,
      expoPushToken,
    });

    // Create a new AuthToken for the user:
    const authToken = AuthService.createAuthToken(newUser);

    // Send response:
    res.status(201).json({ token: authToken.toString() });
  }
);
