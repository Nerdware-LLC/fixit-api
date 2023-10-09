import { eventEmitter } from "@/events/eventEmitter";
import { DeleteMutationResponse } from "@/graphql/_common";
import { getFixitUser } from "@/graphql/_helpers";
import { stripe } from "@/lib/stripe";
import { Invoice } from "@/models/Invoice";
import { GqlUserInputError, GqlForbiddenError } from "@/utils";
import type { InvoiceItem } from "@/models/Invoice";
import type { Resolvers, Invoice as GqlInvoice } from "@/types";
import type { FixitApiAuthTokenPayload } from "@/utils";

export const resolvers: Partial<Resolvers> = {
  Query: {
    invoice: async (parent, { invoiceID }, { user }) => {
      const [queriedInvoice] = await Invoice.query({
        where: { id: invoiceID },
        limit: 1,
      });

      if (!queriedInvoice) throw new GqlUserInputError("Invoice not found.");

      return await getInvoiceCreatedByAndAssignedTo(queriedInvoice, user);
    },
    myInvoices: async (parent, args, { user }) => {
      return {
        createdByUser: await Promise.all(
          (
            await Invoice.query({
              where: {
                createdByUserID: user.id,
                id: { beginsWith: Invoice.SK_PREFIX },
              },
            })
          ).map(async (inv) => ({
            ...inv,
            createdBy: { ...user },
            assignedTo: await getFixitUser(inv.assignedTo, user),
          }))
        ),
        assignedToUser: await Promise.all(
          (
            await Invoice.query({
              where: {
                assignedToUserID: user.id,
                id: { beginsWith: Invoice.SK_PREFIX },
              },
            })
          ).map(async (inv) => ({
            ...inv,
            createdBy: await getFixitUser(inv.createdBy, user),
            assignedTo: { ...user },
          }))
        ),
      };
    },
  },
  Mutation: {
    createInvoice: async (parent, { invoice: invoiceInput }, { user }) => {
      const createdInvoice = await Invoice.createItem({
        createdByUserID: user.id,
        assignedToUserID: invoiceInput.assignedTo,
        amount: invoiceInput.amount,
        status: "OPEN",
        ...(invoiceInput?.workOrderID && {
          workOrderID: invoiceInput.workOrderID,
        }),
      });

      eventEmitter.emitInvoiceCreated(createdInvoice);

      return await getInvoiceCreatedByAndAssignedTo(createdInvoice, user);
    },
    updateInvoiceAmount: async (parent, { invoiceID, amount }, { user }) => {
      const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

      verifyUserCanPerformThisUpdate(existingInv, {
        idOfUserWhoCanPerformThisUpdate: existingInv.createdBy.id,
        authenticatedUserID: user.id,
      });

      const updatedInvoice = await Invoice.updateOne(existingInv, { amount });

      return await getInvoiceCreatedByAndAssignedTo(updatedInvoice, user);
    },
    payInvoice: async (parent, { invoiceID }, { user }) => {
      // IDEA Adding "assigneeUserDefaultPaymentMethodID" to Invoice would reduce queries.
      const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

      verifyUserCanPerformThisUpdate(existingInv, {
        idOfUserWhoCanPerformThisUpdate: existingInv.assignedTo.id,
        authenticatedUserID: user.id,
      });

      // IDEA After default_payment_method is added to db, consider rm'ing this
      const stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerID);

      // Ensure the user hasn't removed themselves as a Stripe Customer
      if (stripeCustomer.deleted) {
        throw new GqlForbiddenError(
          "Invalid Stripe Customer - please review your payment settings in your Stripe Dashboard and try again."
        );
      }

      const paymentIntent = await stripe.paymentIntents.create({
        customer: user.stripeCustomerID,
        payment_method: stripeCustomer.invoice_settings.default_payment_method as string, // Cast from Stripe.StripePaymentMethod, which is only an object when expanded.
        amount: existingInv.amount,
        currency: "usd", // <-- Note: would need to be paramaterized for i18n
        confirm: true,
        on_behalf_of: user.stripeConnectAccount.id,
        transfer_data: {
          destination: user.stripeConnectAccount.id,
        },
      });

      const updatedInvoice = await Invoice.updateOne(existingInv, {
        ...(paymentIntent.status === "succeeded" && { status: "CLOSED" }),
        stripePaymentIntentID: paymentIntent.id,
      });

      return await getInvoiceCreatedByAndAssignedTo(updatedInvoice, user);
    },
    deleteInvoice: async (parent, { invoiceID }, { user }) => {
      const [existingInv] = await Invoice.query({
        where: { id: invoiceID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingInv, {
        idOfUserWhoCanPerformThisUpdate: existingInv.createdBy.id,
        authenticatedUserID: user.id,
      });

      const deletedInvoice = await Invoice.deleteItem({
        createdByUserID: existingInv.createdBy.id,
        id: existingInv.id,
      });

      eventEmitter.emitInvoiceDeleted(deletedInvoice);

      return new DeleteMutationResponse({
        id: deletedInvoice.id,
        wasDeleted: true,
      });
    },
  },
};

/**
  invoice: InvoiceItem,
  userAuthToken: FixitApiAuthTokenPayload
) => ({
  ...invoice,
  createdBy: await getFixitUser(invoice.createdBy, userAuthToken),
  assignedTo: await getFixitUser(invoice.assignedTo, userAuthToken),
});
