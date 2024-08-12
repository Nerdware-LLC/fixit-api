import { PushNotification, type PushNotificationRecipient } from "./PushNotification.js";
import type { InvoiceItem } from "@/models/Invoice";

/**
 * This class represents a push notification for an Invoice event.
 * @extends PushNotification
 * @category Events
 * @subcategory PushNotification
 */
export class InvoicePushNotification extends PushNotification {
  static PUSH_EVENTS = {
    NewInvoice: {
      title: "New Invoice",
      body: "A new Invoice is available.",
    },
    InvoiceUpdated: {
      title: "Invoice Update",
      body: "One of your invoices has been updated.",
    },
    InvoiceDeleted: {
      title: "Invoice Deleted",
      body: "One of your invoices has been deleted.",
    },
    InvoicePaid: {
      title: "Invoice Paid",
      body: "Payment has been submitted for one of your invoices.",
    },
  } as const;

  constructor({
    pushEventName,
    recipientUser,
    invoice: { id: invoiceID },
  }: {
    pushEventName: InvoicePushNotificationEventName;
    recipientUser: PushNotificationRecipient;
    invoice: InvoiceItem;
  }) {
    super({
      pushEventName,
      recipientUser,
      ...InvoicePushNotification.PUSH_EVENTS[pushEventName],
    });

    this.data.invoiceID = invoiceID;
  }
}

/**
 * Union of all possible push event names for InvoicePushNotification.
 */
type InvoicePushNotificationEventName = keyof typeof InvoicePushNotification.PUSH_EVENTS;
