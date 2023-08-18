import { passwordHasher, isValid } from "@/utils";

/**
 * Represents a User login object that can be created with either a password or
 * Google OAuth credentials.
 */
export class UserLogin {
  /**
   * Creates a UserLogin object based on the provided parameters.
   * @param params - The parameters for creating the UserLogin login object.
   * @returns A promise that resolves to the created UserLogin object.
   * @throws Error if the provided parameters are invalid.
   */
  public static readonly createLogin = async <Params extends CreateLoginParams>({
    password,
    googleID,
    googleAccessToken,
  }: Params): Promise<CreateLoginResult<Params>> => {
    let userLogin;

    if (typeof password === "string") {
      // Validate the password
      if (!isValid.password(password)) {
        throw new Error("The provided password does not meet the required criteria");
      }

      userLogin = {
        type: "LOCAL",
        passwordHash: await passwordHasher.getHash(password),
      };
    } else if (typeof googleID === "string" && typeof googleAccessToken === "string") {
      // Perform some basic validation on the Google OAuth params
      if (googleID.length < 5) throw new Error("Invalid Google ID");
      if (googleAccessToken.length < 5) throw new Error("Invalid Google access token");

      userLogin = {
        type: "GOOGLE_OAUTH",
        googleID,
        googleAccessToken,
      };
    } else {
      throw new Error("Invalid login credentials");
    }

    return userLogin as CreateLoginResult<Params>;
  };
}

export type FixitAuthSource = "LOCAL" | "GOOGLE_OAUTH";

export type CreateLoginParams =
  | { password: string; [key: string]: string }
  | { googleID: string; googleAccessToken: string; [key: string]: string }
  | { password?: string; googleID?: string; googleAccessToken?: string };

export type CreateLoginResult<T extends CreateLoginParams> = T extends { password: string }
  ? UserLoginLocal
  : T extends { googleID: string; googleAccessToken: string }
  ? UserLoginGoogleOAuth
  : never;

export type UserLoginU = UserLoginLocal | UserLoginGoogleOAuth;
export type UserLoginLocal = { type: "LOCAL"; passwordHash: string };
export type UserLoginGoogleOAuth = {
  type: "GOOGLE_OAUTH";
  googleID: string;
  googleAccessToken: string;
};
