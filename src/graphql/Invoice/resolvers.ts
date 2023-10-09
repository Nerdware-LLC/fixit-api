import { eventEmitter } from "@/events/eventEmitter";
import { DeleteMutationResponse } from "@/graphql/_common";
import { verifyUserCanPerformThisUpdate, formatAsGqlFixitUser } from "@/graphql/_helpers";
import { stripe } from "@/lib/stripe";
import { Invoice } from "@/models/Invoice";
import { GqlUserInputError, GqlForbiddenError } from "@/utils";
import type { InvoiceItem } from "@/models/Invoice";
import type { Resolvers } from "@/types";
import type { FixitApiAuthTokenPayload } from "@/utils";

export const resolvers: Partial<Resolvers> = {
  Query: {
    invoice: async (_parent, { invoiceID }, { user }) => {
      const [existingInv] = await Invoice.query({
        where: { id: invoiceID },
        limit: 1,
      });

      if (!existingInv) {
        throw new GqlUserInputError("An invoice with the provided ID could not be found.");
      }

      return await formatAsGqlInvoice(existingInv, user);
    },
    myInvoices: async (_parent, _args, { user }) => {
      // Query for all Invoices created by the authenticated User
      const createdByUserQueryResults = await Invoice.query({
        where: {
          createdByUserID: user.id,
          id: { beginsWith: Invoice.SK_PREFIX },
        },
      });

      // Query for all Invoices assigned to the authenticated User
      const assignedToUserQueryResults = await Invoice.query({
        where: {
          assignedToUserID: user.id,
          id: { beginsWith: Invoice.SK_PREFIX },
        },
      });

      // Map each query's results into the GraphQL schema's WorkOrder shape // TODO maybe let resolvers do this?
      return {
        createdByUser: await Promise.all(
          createdByUserQueryResults.map(async (invCreatedByUser) => ({
            ...invCreatedByUser,
            createdBy: { ...user },
            assignedTo: await formatAsGqlFixitUser({ id: invCreatedByUser.assignedToUserID }, user),
          }))
        ),
        assignedToUser: await Promise.all(
          assignedToUserQueryResults.map(async (invAssignedToUser) => ({
            ...invAssignedToUser,
            createdBy: await formatAsGqlFixitUser({ id: invAssignedToUser.createdByUserID }, user),
            assignedTo: { ...user },
          }))
        ),
      };
    },
  },
  Mutation: {
    createInvoice: async (_parent, { invoice: invoiceInput }, { user }) => {
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

      return await formatAsGqlInvoice(createdInvoice, user);
    },
    updateInvoiceAmount: async (_parent, { invoiceID, amount }, { user }) => {
      const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

      verifyUserCanPerformThisUpdate(existingInv, {
        idOfUserWhoCanPerformThisUpdate: existingInv.createdByUserID,
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          CLOSED: "The requested invoice has already been closed.",
          DISPUTED:
            "The requested invoice has been disputed and cannot be updated at this time. " +
            "Please contact the invoice's recipient for details and further assistance.",
        },
      });

      const updatedInvoice = await Invoice.updateItem(
        { id: existingInv.id, createdByUserID: existingInv.createdByUserID },
        {
          update: { amount },
        }
      );

      eventEmitter.emitInvoiceUpdated(updatedInvoice);

      return await formatAsGqlInvoice(updatedInvoice, user);
    },
    payInvoice: async (_parent, { invoiceID }, { user }) => {
      // IDEA Adding "assigneeUserDefaultPaymentMethodID" to Invoice would reduce queries.
      const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

      verifyUserCanPerformThisUpdate(existingInv, {
        idOfUserWhoCanPerformThisUpdate: existingInv.assignedToUserID,
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          CLOSED: "The requested invoice has already been closed.",
          DISPUTED: "The requested invoice has been disputed and cannot be paid at this time.",
        },
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

      const wasInvoiceSuccessfullyPaid = paymentIntent?.status === "succeeded";

      const updatedInvoice = await Invoice.updateItem(
        { id: existingInv.id, createdByUserID: existingInv.createdByUserID },
        {
          update: {
            stripePaymentIntentID: paymentIntent.id,
            ...(wasInvoiceSuccessfullyPaid && { status: "CLOSED" }),
          },
        }
      );

      if (wasInvoiceSuccessfullyPaid) eventEmitter.emitInvoicePaid(updatedInvoice);

      return await formatAsGqlInvoice(updatedInvoice, user);
    },
    deleteInvoice: async (_parent, { invoiceID }, { user }) => {
      const [existingInv] = await Invoice.query({
        where: { id: invoiceID },
        limit: 1,
      });

      verifyUserCanPerformThisUpdate(existingInv, {
        idOfUserWhoCanPerformThisUpdate: existingInv.createdByUserID,
        authenticatedUserID: user.id,
        forbiddenStatuses: {
          CLOSED: "The requested invoice has already been closed.",
          DISPUTED: "The requested invoice has been disputed and cannot be deleted at this time.",
        },
      });

      const deletedInvoice = await Invoice.deleteItem({
        createdByUserID: existingInv.createdByUserID,
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
 * This function converts `Invoice` objects from their internal database shape/format into the
 * GraphQL schema's `Invoice` shape/format.
 */
const formatAsGqlInvoice = async (
  invoice: InvoiceItem,
  userAuthToken: FixitApiAuthTokenPayload
) => ({
  ...invoice,
  createdBy: await formatAsGqlFixitUser({ id: invoice.createdByUserID }, userAuthToken),
  assignedTo: await formatAsGqlFixitUser({ id: invoice.assignedToUserID }, userAuthToken),
});
