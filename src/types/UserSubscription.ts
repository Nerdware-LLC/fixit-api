import { SUBSCRIPTION_STATUSES } from "@models/UserSubscription/validateExisting";
import type { UserType } from "./User";

export interface UserSubscriptionType {
  userID?: UserType["id"];
  sk?: string;
  id: string;
  currentPeriodEnd: Date;
  productID: string;
  priceID: string;
  status: keyof typeof SUBSCRIPTION_STATUSES;
  createdAt: Date;
  updatedAt: Date;
}
