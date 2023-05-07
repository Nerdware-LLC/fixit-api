import type { Simplify } from "type-fest";
import type { UserType } from "./User";

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

export type UserStripeConnectAccountAllFields = Simplify<Required<UserStripeConnectAccountType>>;

export type UserStripeConnectAccountMutableFields = Simplify<
  Partial<
    Pick<UserStripeConnectAccountType, "detailsSubmitted" | "chargesEnabled" | "payoutsEnabled">
  >
>;
