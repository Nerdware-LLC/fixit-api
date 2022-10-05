import { SUBSCRIPTION_STATUSES } from "./validateExisting";

export interface UserSubscriptionType {
  id: string;
  currentPeriodEnd: number;
  productID: string;
  priceID: string;
  status: keyof typeof SUBSCRIPTION_STATUSES;
  createdAt: Date;
  updatedAt: Date;
}
