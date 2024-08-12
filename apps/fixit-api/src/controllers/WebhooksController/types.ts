import type Stripe from "stripe";
import type { ValueOf } from "type-fest";

/**
 * Generic util which takes a Stripe event name and returns the event's `event.data.object` type.
 *
 * @example
 * ```ts
 * GetDataObjectTypeForEvent<"account.updated">; //                  Stripe.Account
 * GetDataObjectTypeForEvent<"customer.subscription.updated">; //    Stripe.Subscription
 * GetDataObjectTypeForEvent<"account.external_account.created">; // Stripe.Card | Stripe.BankAccount
 * ```
 *
 * @see https://www.npmjs.com/package/stripe-event-types
 */
export type GetDataObjectTypeForEvent<EventName extends Stripe.DiscriminatedEvent.Type> = ValueOf<{
  [Obj in Stripe.DiscriminatedEvent as { type: EventName } extends Pick<Obj, "type">
    ? EventName
    : never]: Obj extends { data: { object: object } } ? Obj["data"]["object"] : never;
}>;

/**
 * A map of every Stripe webhook event to its respective `event.data.object` type.
 */
export type StripeEventDataObjectMap = {
  [EventType in Stripe.DiscriminatedEvent.Type]: GetDataObjectTypeForEvent<EventType>;
};

/**
 * A webhook handler for a specific Stripe event. @see {@link StripeEventDataObjectMap}
 */
export type StripeWebhookHandler<EventName extends keyof StripeEventDataObjectMap> = (
  dataObj: StripeEventDataObjectMap[EventName]
) => Promise<void>;
