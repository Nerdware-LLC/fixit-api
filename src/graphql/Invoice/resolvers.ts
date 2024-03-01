import { eventEmitter } from "@/events/eventEmitter.js";
import { DeleteMutationResponse } from "@/graphql/_common";
import {
  verifyUserIsAuthorizedToPerformThisUpdate,
  formatAsGqlFixitUser,
} from "@/graphql/_helpers";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { Invoice, type InvoiceItem } from "@/models/Invoice/Invoice.js";
import { WorkOrder } from "@/models/WorkOrder/WorkOrder.js";
import { GqlUserInputError, GqlForbiddenError } from "@/utils/httpErrors.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Partial<Resolvers> = {
  Query: {
    invoice: async (_parent, { invoiceID }) => {
      const [existingInv] = await Invoice.query({
        where: { id: invoiceID },
        limit: 1,
      });

      assertInvoiceWasFound(existingInv);

      return existingInv;
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
        ...(!!invoiceInput?.workOrderID && {
          workOrderID: invoiceInput.workOrderID,
        }),
      });

      eventEmitter.emitInvoiceCreated(createdInvoice);

      return createdInvoice;
    },
    updateInvoiceAmount: async (_parent, { invoiceID, amount }, { user }) => {
      const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

      verifyUserIsAuthorizedToPerformThisUpdate(existingInv, {
        itemNotFoundErrorMessage: INVOICE_NOT_FOUND_ERROR_MSG,
        idOfUserWhoCanPerformThisUpdate: existingInv?.createdByUserID,
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

      return updatedInvoice;
    },
    payInvoice: async (_parent, { invoiceID }, { user }) => {
      // IDEA Adding "assigneeUserDefaultPaymentMethodID" to Invoice would reduce queries.
      const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

      verifyUserIsAuthorizedToPerformThisUpdate(existingInv, {
        itemNotFoundErrorMessage: INVOICE_NOT_FOUND_ERROR_MSG,
        idOfUserWhoCanPerformThisUpdate: existingInv?.assignedToUserID,
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

      return updatedInvoice;
    },
    deleteInvoice: async (_parent, { invoiceID }, { user }) => {
      const [existingInv] = await Invoice.query({
        where: { id: invoiceID },
        limit: 1,
      });

      verifyUserIsAuthorizedToPerformThisUpdate(existingInv, {
        itemNotFoundErrorMessage: INVOICE_NOT_FOUND_ERROR_MSG,
        idOfUserWhoCanPerformThisUpdate: existingInv?.createdByUserID,
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
  Invoice: {
    createdBy: async (invoice, _args, { user }) => {
      return await formatAsGqlFixitUser({ id: invoice.createdByUserID }, user);
    },

    assignedTo: async (invoice, _args, { user }) => {
      return await formatAsGqlFixitUser({ id: invoice.assignedToUserID }, user);
    },

    workOrder: async (invoice, _args) => {
      if (!invoice?.workOrderID) return null;

      const [workOrder] = await WorkOrder.query({
        where: { id: invoice.workOrderID },
        limit: 1,
      });

      return workOrder ?? null;
    },
  },
};

const INVOICE_NOT_FOUND_ERROR_MSG = "An invoice with the provided ID could not be found.";

/**
 * Asserts that an Invoice was found in the database.
 */
export function assertInvoiceWasFound<Inv extends InvoiceItem>(
  invoice: Inv | undefined
): asserts invoice is NonNullable<Inv> {
  if (!invoice) {
    throw new GqlUserInputError(INVOICE_NOT_FOUND_ERROR_MSG);
  }
}
