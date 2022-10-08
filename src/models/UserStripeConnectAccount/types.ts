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

export type UserStripeConnectAccountAllFields = Expand<Required<UserStripeConnectAccountType>>;

export type UserStripeConnectAccountMutableFields = Expand<
  Partial<
    Pick<UserStripeConnectAccountType, "detailsSubmitted" | "chargesEnabled" | "payoutsEnabled">
  >
>;
