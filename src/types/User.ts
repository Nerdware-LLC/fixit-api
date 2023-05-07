import type { Simplify } from "type-fest";
import type { UserStripeConnectAccountType } from "./UserStripeConnectAccount";
import type { UserSubscriptionType } from "./UserSubscription";

export interface UserType {
  id: string;
  sk?: string;
  handle: string;
  email: string;
  phone: string;
  expoPushToken?: string;
  profile: UserProfile;
  login: UserLogin;
  stripeCustomerID: string;
  stripeConnectAccount?: UserStripeConnectAccountType;
  subscription?: UserSubscriptionType;
  createdAt: Date;
  updatedAt: Date;
}

// AuthenticatedUser overrides optionality of certain fields.
export type AuthenticatedUser = Simplify<
  Omit<
    UserType, // Omit changed fields which are intersected below
    "stripeConnectAccount" | "subscription" | "createdAt" | "updatedAt"
  > & {
    stripeConnectAccount: UserStripeConnectAccountType; // Required
    subscription: UserSubscriptionType; //                 Required
    createdAt?: Date; //                                   Optional
    updatedAt?: Date; //                                   Optional
  }
>;

export interface UserProfile {
  displayName: string;
  givenName?: string;
  familyName?: string;
  businessName?: string;
  photoUrl?: string;
}

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
