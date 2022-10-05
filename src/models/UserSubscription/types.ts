import type { UserType } from "@models/User/types";
import { SUBSCRIPTION_STATUSES } from "./validateExisting";

export interface UserSubscriptionType {
  userID?: UserType["id"];
  id: string;
  sk?: string;
  currentPeriodEnd: Date;
  productID: string;
  priceID: string;
  status: keyof typeof SUBSCRIPTION_STATUSES;
  createdAt: Date;
  updatedAt: Date;
}
