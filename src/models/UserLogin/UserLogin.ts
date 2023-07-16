import { passwordHasher } from "@utils/passwordHasher";
import type { UserModelItem } from "@models/User";

export class UserLogin {
  public static readonly createLogin = async ({
    password,
    googleID,
    googleAccessToken,
  }: CreateLoginParams): Promise<UserModelItem["login"]> => ({
    ...(password
      ? {
          type: "LOCAL",
          passwordHash: await passwordHasher.getHash(password),
        }
      : ({
          type: "GOOGLE_OAUTH",
          googleID,
          googleAccessToken,
        } as UserLoginGoogleOAuth)),
  });
}

export type FixitAuthSource = "LOCAL" | "GOOGLE_OAUTH";

export type CreateLoginParams = {
  password?: string;
  googleID?: string;
  googleAccessToken?: string;
};

export type UserLoginU = UserLoginLocal | UserLoginGoogleOAuth;
export type UserLoginLocal = { type: "LOCAL"; passwordHash: string };
export type UserLoginGoogleOAuth = {
  type: "GOOGLE_OAUTH";
  googleID: string;
  googleAccessToken: string;
};
