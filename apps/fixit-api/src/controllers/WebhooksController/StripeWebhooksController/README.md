# Stripe Webhooks Controller

This controller maps Stripe webhook event-names to their respective event-handlers.

### Event-Handler Design Goals

Each `eventHandler` is designed to achieve the following design goals:

- Each event handler takes the event's `data.object` as its sole argument.
- Each event handler is responsible for logging any errors it encounters.
- Events with function-handlers are considered _actionable_ events (see below).
- Events with `null`-handlers are considered _non-actionable_ events (see below).
- Events not included are considered _unhandled_ events (see below).

## Stripe Webhook Event Actionability

This API places each event-type into 1 of 3 categories:

1. ### _`actionable`_`events`

   - ✅ Have been registered with Stripe
   - ✅ Have one or more associated event-handlers

2. ### _`non-actionable`_`events`

   - ✅ Have been registered with Stripe
   - ❌ Do NOT have any associated event-handlers, typically because they contain
     data that is not persisted by the Fixit back-end at this time.

3. ### _`unhandled`_`events`

   - ❌ Have NOT been registered with Stripe, and therefore are NOT expected to be received.
   - ❌ Do NOT have any associated event-handlers
     > _If an unhandled event is received, it is logged as an error._

## Customer Portal Events

The events listed below may be triggered by actions taken by Customers in the Stripe-provided
customer portal. Descriptions of each event and the data contained in its `data.object` can be
found [here](https://stripe.com/docs/customer-management/integrate-customer-portal#webhooks).

- `billing_portal.configuration.created`
- `billing_portal.configuration.updated`
- `billing_portal.session.created`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `customer.subscription.updated`
- `customer.tax_id.created`
- `customer.tax_id.deleted`
- `customer.tax_id.updated`
- `customer.updated`
- `payment_method.attached`
- `payment_method.detached`
