import { isValidPassword } from "@nerdware/ts-string-helpers";
import { isString } from "@nerdware/ts-type-safety-utils";
import { passwordHasher } from "@/utils/passwordHasher.js";
import type { CombineUnionOfObjects } from "@/types/helpers.js";
import type { Simplify } from "type-fest";

/**
 * Represents a User login object that can be created with either a password or
 * Google OAuth credentials.
 */
export class UserLogin {
  public static readonly TYPES = {
    LOCAL: "LOCAL",
    GOOGLE_OAUTH: "GOOGLE_OAUTH",
  } as const;

  /**
   * Creates a UserLogin object of a `type` determined by the provided parameters.
   * @param params - The parameters for creating the UserLogin login object.
   * @returns A promise that resolves to the created UserLogin object.
   * @throws Error if the provided parameters are invalid.
   */
  public static readonly createLogin = async ({
    password,
    googleID,
  }: LoginParams): Promise<UserLoginLocal | UserLoginGoogleOAuth> => {
    // Run the appropriate method based on the provided params
    const userLogin = isString(password)
      ? await UserLogin.createLoginLocal(password)
      : isString(googleID)
        ? UserLogin.createLoginGoogleOAuth(googleID)
        : null;

    // Ensure that the userLogin object is not null:
    if (!userLogin) throw new Error("Invalid login credentials");

    return userLogin;
  };

  /**
   * Alias for {@link UserLogin.createLogin}
   */
  public static readonly fromParams = UserLogin.createLogin;

  /**
   * Creates a {@link UserLoginLocal} object from the provided password (if it's valid).
   */
  public static readonly createLoginLocal = async (password: string): Promise<UserLoginLocal> => {
    // Validate the password
    if (!isValidPassword(password)) {
      throw new Error("The provided password does not meet the required criteria");
    }
    return {
      type: UserLogin.TYPES.LOCAL,
      passwordHash: await passwordHasher.getHash(password),
    };
  };

  /**
   * Creates a {@link UserLoginGoogleOAuth} object from the provided googleID (if it's valid).
   */
  public static readonly createLoginGoogleOAuth = (googleID: string): UserLoginGoogleOAuth => {
    // Perform some basic validation on the Google OAuth params
    if (googleID.length < 5) throw new Error("Invalid Google ID");
    return {
      type: UserLogin.TYPES.GOOGLE_OAUTH,
      googleID,
    };
  };
}

/////////////////////////////////////////////////////////////////////
// LOGIN TYPES:

/**
 * `UserLogin` params
 */
export type LoginParams = {
  password?: string | undefined;
  googleID?: string | undefined;
};

/**
 * A combination of every `UserLogin` object type in the {@link UserLoginU} union.
 */
export type UserLoginObject = CombineUnionOfObjects<UserLoginU>;

/**
 * A union of `UserLogin` object types, discriminated by the {@link FixitApiLoginAuthType|`type` string literal property}.
 * > Use this `UserLogin` type when you want type inference based on the `type` property.
 */
export type UserLoginU = UserLoginLocal | UserLoginGoogleOAuth;

/**
 * A `UserLogin` object that was created via the local JWT auth mechanism.
 */
export type UserLoginLocal = Simplify<
  BaseUserLoginType<typeof UserLogin.TYPES.LOCAL> & { passwordHash: string }
>;

/**
 * A `UserLogin` object that was created via Google OAuth.
 */
export type UserLoginGoogleOAuth = Simplify<
  BaseUserLoginType<typeof UserLogin.TYPES.GOOGLE_OAUTH> & { googleID: string }
>;

/**
 * This base type for all UserLogin types defines the `type` discriminant property.
 */
interface BaseUserLoginType<AuthType extends FixitApiLoginAuthType = FixitApiLoginAuthType> {
  type: AuthType;
}

/**
 * A union of string literals for the `type` discriminant property of `UserLogin` objects.
 */
type FixitApiLoginAuthType = keyof typeof UserLogin.TYPES;
