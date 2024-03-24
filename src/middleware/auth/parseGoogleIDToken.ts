import { parseGoogleOAuth2IDToken } from "@/lib/googleOAuth2Client";
import { mwAsyncCatchWrapper } from "@/middleware/helpers.js";
import type { RestApiRequestBodyByPath } from "@/types/open-api.js";

/**
 * This middleware parses and validates a `googleIDToken` if provided. If valid,
 * it is decoded to obtain the fields listed below. These fields are then used to
 * create login args, which are added to `res.locals.googleIDTokenFields` and
 * `req.body` to be read by downstream auth middleware.
 *
 * **Fields obtained from the `googleIDToken`:**
 *
 * - `googleID`
 * - `email`
 * - `givenName`
 * - `familyName`
 * - `picture` (profile photo URL)
 *
 * > **The structure of Google JWT ID tokens is available here:**
 * > https://developers.google.com/identity/gsi/web/reference/js-reference#credential
 *
 * @see https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 */
export const parseGoogleIDToken = mwAsyncCatchWrapper<
  /**
   * Since this mw creates user login args from the supplied Google ID token and adds
   * them to the `req.body` object, an intersection is used for the type param here to
   * tell downstream mw that `req.body` will include fields they require. Without this
   * intersection, TS complains about the perceived `req.body` type mismatch.
   */
  RestApiRequestBodyByPath["/auth/google-token"] &
    RestApiRequestBodyByPath["/auth/login"] &
    RestApiRequestBodyByPath["/auth/register"]
>(async (req, res, next) => {
  // Since this mw is used on routes where auth via GoogleIDToken is optional, check if provided.
  if (!req.body.googleIDToken) return next();

  // Parse the google ID token:
  const { _isValid, email, googleID, profile } = await parseGoogleOAuth2IDToken(
    req.body.googleIDToken
  );

  // Add the fields to res.locals.googleIDTokenFields:
  res.locals.googleIDTokenFields = {
    _isValid,
    email,
    googleID,
    profile,
  };

  // If not already present, add email to req.body for use by downstream mw (used by findUserByEmail)
  if (!req.body.email) req.body.email = email;

  next();
});
