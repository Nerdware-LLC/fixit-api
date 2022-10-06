import type { UserType } from "@models/User/types";

export interface UserStripeConnectAccountType {
  userID?: UserType["id"];
  sk?: string;
  id: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
