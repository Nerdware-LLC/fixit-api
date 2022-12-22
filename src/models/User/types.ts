import type { UserSubscriptionType } from "@models/UserSubscription/types";
import type { UserStripeConnectAccountType } from "@models/UserStripeConnectAccount/types";

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
export type AuthenticatedUser = Expand<
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
