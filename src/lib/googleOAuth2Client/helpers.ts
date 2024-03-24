import {
  sanitizeID,
  isValidID,
  sanitizeEmail,
  isValidEmail,
  sanitizeAlphabetic,
  isValidAlphabetic,
  sanitizeURL,
  isValidURL,
} from "@nerdware/ts-string-helpers";
import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { AuthError } from "@/utils/httpErrors.js";
import { googleOAuth2Client } from "./googleOAuth2Client";
import type { TokenPayload as GoogleOAuth2IDTokenPayload } from "google-auth-library";

/**
 * This function validates and parses a Google OAuth2 ID token, including the
 * relevant payload fields extracted from it.
 *
 * > **The structure of Google JWT ID tokens is available here:**
 * > https://developers.google.com/identity/gsi/web/reference/js-reference#credential
 *
 * @see https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 */
export const parseGoogleOAuth2IDToken = async (
  rawGoogleIDToken: string
): Promise<ParsedGoogleOAuth2IDTokenFields> => {
  // Initialize variable to hold the token payload:
  let tokenPayload: GoogleOAuth2IDTokenPayload | undefined;

  try {
    const ticket = await googleOAuth2Client.verifyIdToken({ idToken: rawGoogleIDToken });

    tokenPayload = ticket.getPayload();
  } catch (err) {
    // Re-throw as AuthError
    throw new AuthError(
      getTypeSafeError(err, { fallBackErrMsg: DEFAULT_GOOGLE_OAUTH_ERR_MSG }).message
    );
  }

  if (!tokenPayload) throw new AuthError(DEFAULT_GOOGLE_OAUTH_ERR_MSG);

  const {
    email: unsanitized_email,
    sub: unsanitized_googleID,
    given_name: unsanitized_givenName,
    family_name: unsanitized_familyName,
    picture: unsanitized_profilePhotoURL,
  } = tokenPayload;

  // Ensure the payload includes an `email`:
  if (!unsanitized_email) throw new AuthError(DEFAULT_GOOGLE_OAUTH_ERR_MSG);

  // Sanitize the relevant payload fields (optional fields use `let`, default to null if invalid)

  const email = sanitizeEmail(unsanitized_email);
  const googleID = sanitizeID(unsanitized_googleID);
  let givenName = unsanitized_givenName ? sanitizeAlphabetic(unsanitized_givenName) : null;
  let familyName = unsanitized_familyName ? sanitizeAlphabetic(unsanitized_familyName) : null;
  let profilePhotoUrl = unsanitized_profilePhotoURL
    ? sanitizeURL(unsanitized_profilePhotoURL)
    : null;

  // Validate the REQUIRED payload fields (if invalid, throw error)
  if (!isValidEmail(email) || !isValidID(googleID)) {
    throw new AuthError(DEFAULT_GOOGLE_OAUTH_ERR_MSG);
  }

  // Validate the OPTIONAL payload fields (if invalid, set to null)
  if (!isValidAlphabetic(givenName)) givenName = null;
  if (!isValidAlphabetic(familyName)) familyName = null;
  if (!isValidURL(profilePhotoUrl)) profilePhotoUrl = null;

  return {
    _isValid: true,
    email,
    googleID,
    profile: {
      givenName,
      familyName,
      photoUrl: profilePhotoUrl,
    },
  };
};

const DEFAULT_GOOGLE_OAUTH_ERR_MSG = "Invalid credentials";

/**
 * The fields returned by {@link parseGoogleOAuth2IDToken}
 */
export type ParsedGoogleOAuth2IDTokenFields = {
  _isValid: boolean;
  email: string;
  googleID: string;
  profile: {
    givenName: string | null;
    familyName: string | null;
    photoUrl: string | null;
  };
};
