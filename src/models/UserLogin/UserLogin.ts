import { isValidPassword } from "@nerdware/ts-string-helpers";
import { isString } from "@nerdware/ts-type-safety-utils";
import { passwordHasher } from "@/utils/passwordHasher.js";

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

    if (isString(password)) {
      // Validate the password
      if (!isValidPassword(password)) {
        throw new Error("The provided password does not meet the required criteria");
      }

      userLogin = {
        type: "LOCAL",
        passwordHash: await passwordHasher.getHash(password),
      };
    } else if (isString(googleID) && isString(googleAccessToken)) {
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

// TODO Use open-api schema types to replace/modify the Login types below

/** This type is used in `User.createOne()`. */
export type CreateLoginParams =
  | { password: string; [key: string]: string | undefined }
  | { googleID: string; googleAccessToken: string; [key: string]: string | undefined }
  | {
      password?: string | undefined;
      googleID?: string | undefined;
      googleAccessToken?: string | undefined;
    };

type CreateLoginResult<T extends CreateLoginParams> = T extends { password: string }
  ? UserLoginLocal
  : T extends { googleID: string; googleAccessToken: string }
    ? UserLoginGoogleOAuth
    : never;

/** This type is used in `UserItem`. */
export type UserLoginU = UserLoginLocal | UserLoginGoogleOAuth;

type UserLoginLocal = { type: "LOCAL"; passwordHash: string };

type UserLoginGoogleOAuth = {
  type: "GOOGLE_OAUTH";
  googleID: string;
  googleAccessToken: string;
};
