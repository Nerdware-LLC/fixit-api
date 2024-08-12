import { OAuth2Client } from "google-auth-library";
import { ENV } from "@/server/env";

/**
 * Google OAuth2 Client
 *
 * @see https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 */
export const googleOAuth2Client = new OAuth2Client({
  clientId: ENV.GOOGLE_OAUTH.CLIENT_ID,
  clientSecret: ENV.GOOGLE_OAUTH.CLIENT_SECRET,
});
