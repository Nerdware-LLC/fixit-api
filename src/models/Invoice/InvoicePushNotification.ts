import type { Invoice } from "./types";

export class InvoicePushNotification {
  static PUSH_EVENTS: Record<string, { title: string; body: string }> = {
    NewInvoice: {
      title: "New Invoice",
      body: "A new Invoice is available."
    },
    InvoiceUpdated: {
      title: "Invoice Update",
      body: "One of your invoices has been updated."
    },
    InvoiceDeleted: {
      title: "Invoice Deleted",
      body: "One of your invoices has been deleted."
    },
    InvoicePaid: {
      title: "Invoice Paid",
      body: "Payment has been submitted for one of your invoices."
    }
  };

  to?: string;
  title: string;
  body: string;
  data: {
    _recipientUser: string;
    _eventName: InvoicePushNotificationEventName;
    invoiceID: string;
  };

  constructor({
    pushEventName,
    recipientUser: { id: userID, expoPushToken },
    invoice: { id: invoiceID }
  }: {
    pushEventName: InvoicePushNotificationEventName;
    recipientUser: { id: string; expoPushToken?: string };
    invoice: Invoice;
  }) {
    // push token may not be present for fns which batchGet them later on
    if (expoPushToken) this.to = expoPushToken;

    const { title, body } = InvoicePushNotification.PUSH_EVENTS[pushEventName];

    this.title = title;
    this.body = body;
    this.data = {
      _recipientUser: userID,
      _eventName: pushEventName,
      invoiceID
    };
  }
}

type InvoicePushNotificationEventName = keyof typeof InvoicePushNotification.PUSH_EVENTS;
