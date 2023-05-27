import type { SubscriptionStatus } from "@types";

export type InternalDbUserSubscription = {
  userID?: string;
  sk: string;
  id: string;
  currentPeriodEnd: Date;
  productID: string;
  priceID: string;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
};
