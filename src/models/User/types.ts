import type { InternalDbProfile } from "../Profile/types";
import type { InternalDbUserStripeConnectAccount } from "../UserStripeConnectAccount/types";
import type { InternalDbUserSubscription } from "../UserSubscription/types";

export type InternalDbUser = {
  id: string;
  sk: string;
  handle: string;
  email: string;
  phone: string;
  expoPushToken?: string;
  profile: InternalDbProfile;
  login: UserLogin;
  stripeCustomerID: string;
  stripeConnectAccount: InternalDbUserStripeConnectAccount;
  subscription?: InternalDbUserSubscription;
  createdAt: Date;
  updatedAt: Date;
};

export type UserLogin = UserLoginLocal | UserLoginGoogleOAuth;

export interface UserLoginLocal {
  type: "LOCAL";
  passwordHash: string;
}

export interface UserLoginGoogleOAuth {
  type: "GOOGLE_OAUTH";
  googleID: string;
  googleAccessToken: string;
}
