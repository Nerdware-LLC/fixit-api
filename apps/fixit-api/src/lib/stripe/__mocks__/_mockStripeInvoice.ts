import dayjs from "dayjs";
import deepMerge from "lodash.merge";
import { mockStripePaymentIntent } from "./_mockStripePaymentIntent.js";
import type { UserItem } from "@/models/User";
import type { UserSubscriptionItem } from "@/models/UserSubscription";
import type Stripe from "stripe";
import type { PartialDeep } from "type-fest";

/**
 * Returns a mock Stripe Invoice object.
 * @see https://stripe.com/docs/api/invoices/object
 */
export const mockStripeInvoice = (
  /** The mock User who is the customer/recipient of the invoice */
  {
    stripeCustomerID,
    email,
    phone = null,
    profile,
    subscription,
  }: UserItem & { subscription?: UserSubscriptionItem },
  /** Invoice object overrides */
  customValues?: PartialDeep<Stripe.Invoice, { recurseIntoArrays: true }> | null
): Stripe.Invoice => {
  // Destructure some pertinent values from the customValues object
  const {
    id: invoiceID = "in_TestTestTest",
    total = 500,
    amount_paid = 0,
    created: invoiceCreatedAtUnixTimestamp = dayjs().unix(),
    ...otherCustomValues
  } = customValues ?? {};

  const invoicePeriodEndTimestamp = dayjs(invoiceCreatedAtUnixTimestamp).add(1, "day").unix();

  // Default mock Invoice object
  const defaultMockInvoiceObj: Stripe.Invoice = {
    object: "invoice",
    id: invoiceID,
    account_country: "US",
    account_name: profile.displayName,
    account_tax_ids: null,
    amount_due: total - amount_paid,
    amount_paid,
    amount_remaining: total - amount_paid,
    application: null,
    application_fee_amount: null,
    attempt_count: 0,
    attempted: false,
    auto_advance: false,
    automatic_tax: { enabled: false, status: null },
    billing_reason: "subscription_create",
    charge: null,
    collection_method: "charge_automatically",
    created: invoiceCreatedAtUnixTimestamp,
    currency: "usd",
    custom_fields: null,
    customer: stripeCustomerID,
    customer_address: null,
    customer_email: email,
    customer_name: profile.displayName,
    customer_phone: phone,
    customer_shipping: null,
    customer_tax_exempt: "none",
    customer_tax_ids: [],
    default_payment_method: null,
    default_source: null,
    default_tax_rates: [],
    description: null,
    discount: null,
    discounts: [],
    due_date: null,
    ending_balance: null,
    footer: null,
    from_invoice: null,
    hosted_invoice_url: null,
    invoice_pdf: null,
    last_finalization_error: null,
    latest_revision: null,
    lines: {
      object: "list",
      url: `/v1/invoices/${invoiceID}/lines`,
      has_more: false,
      data: [
        {
          object: "line_item",
          id: "il_TestTestTest",
          amount: total,
          amount_excluding_tax: total,
          currency: "usd",
          description: "Mock Invoice Line Item",
          discount_amounts: [],
          discountable: true,
          discounts: [],
          invoice_item: "ii_TestTestTest",
          livemode: false,
          metadata: {},
          period: {
            start: invoiceCreatedAtUnixTimestamp,
            end: invoicePeriodEndTimestamp,
          },
          price: null,
          plan: null,
          proration: false,
          proration_details: { credited_items: null },
          quantity: 1,
          subscription: subscription?.id ?? `sub_TestTestTest`,
          tax_amounts: [],
          tax_rates: [],
          type: "invoiceitem",
          unit_amount_excluding_tax: `${total}`,
        },
      ],
    },
    livemode: false,
    metadata: {},
    next_payment_attempt: null,
    number: null,
    on_behalf_of: null,
    paid: false,
    paid_out_of_band: false,
    payment_intent: amount_paid === 0 ? null : mockStripePaymentIntent({ amount: amount_paid }),
    payment_settings: {
      default_mandate: null,
      payment_method_options: null,
      payment_method_types: null,
    },
    period_end: invoicePeriodEndTimestamp,
    period_start: invoiceCreatedAtUnixTimestamp,
    post_payment_credit_notes_amount: 0,
    pre_payment_credit_notes_amount: 0,
    quote: null,
    receipt_number: null,
    rendering_options: null,
    starting_balance: 0,
    statement_descriptor: null,
    status: total === amount_paid ? "paid" : "open",
    status_transitions: {
      finalized_at: null,
      marked_uncollectible_at: null,
      paid_at: null,
      voided_at: null,
    },
    subscription: subscription?.id ?? `sub_TestTestTest`,
    subtotal: total,
    subtotal_excluding_tax: total,
    tax: null,
    test_clock: null,
    total,
    total_discount_amounts: [],
    total_excluding_tax: total,
    total_tax_amounts: [],
    transfer_data: null,
    webhooks_delivered_at: null,
  };

  return deepMerge(defaultMockInvoiceObj, otherCustomValues);
};
