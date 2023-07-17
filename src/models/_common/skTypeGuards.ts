import { CONTACT_SK_PREFIX_STR } from "../Contact/regex";
import { INVOICE_SK_PREFIX_STR } from "../Invoice/regex";
import { USER_SK_PREFIX_STR } from "../User/regex";
import { STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR } from "../UserStripeConnectAccount/regex";
import { USER_SUBSCRIPTION_SK_PREFIX_STR } from "../UserSubscription/regex";
import { WORK_ORDER_SK_PREFIX_STR } from "../WorkOrder/regex";
import type { ContactModelItem } from "../Contact";
import type { InvoiceModelItem } from "../Invoice";
import type { UserModelItem } from "../User";
import type { UserStripeConnectAccountModelItem } from "../UserStripeConnectAccount";
import type { UserSubscriptionModelItem } from "../UserSubscription";
import type { WorkOrderModelItem } from "../WorkOrder";

/**
 * This object contains type-guard functions which ascertain whether a given object
 * is of a certain internal-database type using the object's `sk` attribute. For
 * example, `skIndicatesItemIs.user` determines if an object is an `UserModelItem`.
 */
export const skTypeGuards = {
  isContact: (obj: { sk?: string; [K: PropertyKey]: any }): obj is ContactModelItem => {
    return !!obj.sk?.startsWith(`${CONTACT_SK_PREFIX_STR}#`);
  },
  isInvoice: (obj: { sk?: string; [K: PropertyKey]: any }): obj is InvoiceModelItem => {
    return !!obj.sk?.startsWith(`${INVOICE_SK_PREFIX_STR}#`);
  },
  isUser: (obj: { sk?: string; [K: PropertyKey]: any }): obj is UserModelItem => {
    return !!obj.sk?.startsWith(`${USER_SK_PREFIX_STR}#`);
  },
  isUserStripeConnectAccount: (obj: {
    sk?: string;
    [K: PropertyKey]: any;
  }): obj is UserStripeConnectAccountModelItem => {
    return !!obj.sk?.startsWith(`${STRIPE_CONNECT_ACCOUNT_SK_PREFIX_STR}#`);
  },
  isUserSubscription: (obj: {
    sk?: string;
    [K: PropertyKey]: any;
  }): obj is UserSubscriptionModelItem => {
    return !!obj.sk?.startsWith(`${USER_SUBSCRIPTION_SK_PREFIX_STR}#`);
  },
  isWorkOrder: (obj: { sk?: string; [K: PropertyKey]: any }): obj is WorkOrderModelItem => {
    return !!obj.sk?.startsWith(`${WORK_ORDER_SK_PREFIX_STR}#`);
  },
};
