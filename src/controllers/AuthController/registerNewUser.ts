import {
  sanitizeHandle,
  isValidHandle,
  sanitizePhone,
  isValidPhone,
} from "@nerdware/ts-string-helpers";
import { getRequestBodySanitizer } from "@/controllers/_helpers";
import { AuthService } from "@/services/AuthService";
import { UserService } from "@/services/UserService";
import { LOGIN_CREDENTIALS_REQ_BODY_SCHEMA, requirePasswordOrGoogleIDToken } from "./_common.js";
import type { ApiController } from "@/controllers/types.js";
import type { ParsedGoogleOAuth2IDTokenFields } from "@/services/AuthService/GoogleOAuth2IDToken.js";

/**
 * This controller method registers a new user.
 *
 * > Endpoint: `POST /api/auth/register`
 */
export const registerNewUser: ApiController<"/auth/register"> = async (req, res, next) => {
  try {
    const {
      handle,
      email,
      phone = null,
      password,
      googleIDToken,
      expoPushToken,
    } = sanitizeRegisterUserRequest(req);

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
  } catch (err) {
    next(err);
  }
};

const sanitizeRegisterUserRequest = getRequestBodySanitizer<"/auth/register">({
  requestBodySchema: {
    handle: {
      type: "string",
      required: true,
      nullable: false,
      sanitize: sanitizeHandle,
      validate: isValidHandle,
    },
    phone: {
      type: "string",
      required: false,
      nullable: true,
      sanitize: sanitizePhone,
      validate: isValidPhone,
    },
    ...LOGIN_CREDENTIALS_REQ_BODY_SCHEMA,
  },
  validateRequestBody: requirePasswordOrGoogleIDToken,
});
