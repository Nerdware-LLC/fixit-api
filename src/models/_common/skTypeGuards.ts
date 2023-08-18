import { CONTACT_SK_PREFIX_STR } from "@/models/Contact/regex";
import { INVOICE_SK_PREFIX_STR } from "@/models/Invoice/regex";
import { USER_SK_PREFIX_STR } from "@/models/User/regex";
import { STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR as SCA_SK_PREFIX_STR } from "@/models/UserStripeConnectAccount/regex";
import { USER_SUB_SK_PREFIX_STR as SUB_SK_PREFIX_STR } from "@/models/UserSubscription/regex";
import { WORK_ORDER_SK_PREFIX_STR } from "@/models/WorkOrder/regex";
import type { ContactModelItem } from "@/models/Contact";
import type { InvoiceModelItem } from "@/models/Invoice";
import type { UserModelItem } from "@/models/User";
import type { UserStripeConnectAccountModelItem as UserSCAModelItem } from "@/models/UserStripeConnectAccount";
import type { UserSubscriptionModelItem as UserSubModelItem } from "@/models/UserSubscription";
import type { WorkOrderModelItem } from "@/models/WorkOrder";

/**
 * Functions which ascertain whether a given string is a valid `sk` value for an
 * internal-db type.
 */
export const isSKofType = {
  contact: (str?: string) => !!str && str.startsWith(`${CONTACT_SK_PREFIX_STR}#`),
  invoice: (str?: string) => !!str && str.startsWith(`${INVOICE_SK_PREFIX_STR}#`),
  user: (str?: string) => !!str && str.startsWith(`${USER_SK_PREFIX_STR}#`),
  stripeConnectAccount: (str?: string) => !!str && str.startsWith(`${SCA_SK_PREFIX_STR}#`),
  subscription: (str?: string) => !!str && str.startsWith(`${SUB_SK_PREFIX_STR}#`),
  workOrder: (str?: string) => !!str && str.startsWith(`${WORK_ORDER_SK_PREFIX_STR}#`),
};

/**
 * Type-guard functions which ascertain whether a given object is of a certain
 * internal-database type using the object's `sk` attribute value. For example,
 * `skTypeGuards.isUser` determines if an object is a `UserModelItem`.
 */
export const skTypeGuards = {
  isContact: (obj: SkTypeGuardArg): obj is ContactModelItem => isSKofType.contact(obj?.sk),
  isInvoice: (obj: SkTypeGuardArg): obj is InvoiceModelItem => isSKofType.invoice(obj?.sk),
  isUser: (obj: SkTypeGuardArg): obj is UserModelItem => isSKofType.user(obj?.sk),
  isUserStripeConnectAccount: (obj: SkTypeGuardArg): obj is UserSCAModelItem =>
    isSKofType.stripeConnectAccount(obj?.sk),
  isUserSubscription: (obj: SkTypeGuardArg): obj is UserSubModelItem =>
    isSKofType.subscription(obj?.sk),
  isWorkOrder: (obj: SkTypeGuardArg): obj is WorkOrderModelItem => isSKofType.workOrder(obj?.sk),
};

export interface SkTypeGuardArg {
  sk?: string;
  [K: PropertyKey]: any;
}
