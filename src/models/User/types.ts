// TODO Download TS types from Apollo typedefs codegen endpoint once server is up

export interface User {
  id: string;
  email: string;
  phone: string;
  expoPushToken?: string;
  profile: UserProfile;
  login: UserLoginLocal | UserLoginGoogleOAuth;
  stripeCustomerID: string;
  stripeConnectAccount?: UserStripeConnectAccount;
  subscription: UserSubscription;
}

export interface UserProfile {
  id: string;
  givenName?: string;
  familyName?: string;
  businessName?: string;
  photoUrl?: string;
}

export interface UserLoginLocal {
  type: "LOCAL";
  passwordHash: string;
}

export interface UserLoginGoogleOAuth {
  type: "GOOGLE_OAUTH";
  googleID: string;
  googleAccessToken: string;
}

export interface UserStripeConnectAccount {
  id: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface UserSubscription {
  id: string;
  currentPeriodEnd: number;
  productID: string;
  priceID: string;
  status: UserSubscriptionStatus;
  createdAt: number;
}

export enum UserSubscriptionStatus {
  active,
  incomplete,
  incomplete_expired,
  trialing,
  past_due,
  canceled,
  unpaid
}
