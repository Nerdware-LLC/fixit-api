import { PushNotification } from "./_PushNotification";
import type { InvoiceModelItem } from "@models/Invoice";

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
    recipientUser: { id: string; expoPushToken?: string };
    invoice: InvoiceModelItem;
  }) {
    super({
      pushEventName,
      recipientUser,
      ...InvoicePushNotification.PUSH_EVENTS[pushEventName],
    });

    this.data.invoiceID = invoiceID;
  }
}

type InvoicePushNotificationEventName = keyof typeof InvoicePushNotification.PUSH_EVENTS;
