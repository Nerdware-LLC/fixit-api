import { DeleteMutationResponse } from "@graphql/_common";
import { stripe } from "@lib/stripe";
import { Invoice } from "@models/Invoice";
import { User } from "@models/User";
import { GqlUserInputError, GqlForbiddenError, normalizeInput } from "@utils";
import type { Resolvers } from "@types";

export const resolvers: Partial<Resolvers> = {
  Query: {
    invoice: async (parent, { invoiceID }) => {
      return await Invoice.queryInvoiceByID(invoiceID);
    },
    myInvoices: async (parent, args, { user }) => {
      return {
        createdByUser: await Invoice.queryUsersInvoices(user.id),
        assignedToUser: await Invoice.queryInvoicesAssignedToUser(user.id),
      };
    },
  },
  Mutation: {
    createInvoice: async (parent, { invoice: invoiceInput }, { user }) => {
      return await Invoice.createOne({
        createdByUserID: user.id,
        assignedToUserID: invoiceInput.assignedTo,
        amount: invoiceInput.amount,
        workOrderID: invoiceInput?.workOrderID ?? null,
      } as any); // FIXME
    },
    updateInvoiceAmount: async (parent, { invoiceID, amount }, { user }) => {
      const existingInv = await Invoice.queryInvoiceByID(invoiceID);

      if (!existingInv) throw new GqlUserInputError("Invoice not found.");
      if (existingInv.createdByUserID !== user.id) throw new GqlForbiddenError("Access denied.");
      if (existingInv.status !== "OPEN")
        throw new GqlForbiddenError(`Cannot modify a ${existingInv.status} invoice.`);

      return await Invoice.updateOne(existingInv, { amount });
    },
    payInvoice: async (parent, { invoiceID }, { user }) => {
      // TODO Maybe add "assigneeUserDefaultPaymentMethodID" to Invoice - reduce queries.
      const existingInv = await Invoice.queryInvoiceByID(invoiceID);

      if (!existingInv) throw new GqlUserInputError("Invoice not found.");
      if (existingInv.assignedToUserID !== user.id) throw new GqlForbiddenError("Access denied.");
      if (existingInv.status !== "OPEN")
        throw new GqlForbiddenError(`Cannot pay a ${existingInv.status} invoice.`);

      // TODO after default_payment_method is added to db, remove 1 or both of these lines.
      const payingUser = await User.getUserByID(existingInv.assignedToUserID);
      const stripeCustomer = await stripe.customers.retrieve(payingUser.stripeCustomerID);

      if (!payingUser.stripeConnectAccount?.id) {
        throw new GqlForbiddenError(
          "Invalid Stripe Connect account - please review your payment settings and try again."
        );
      }

      if (stripeCustomer.deleted) {
        throw new GqlForbiddenError(
          "Invalid Stripe Customer - please review your payment settings and try again."
        );
      }

      const paymentIntent = await stripe.paymentIntents.create({
        customer: payingUser.stripeCustomerID,
        payment_method: stripeCustomer.invoice_settings.default_payment_method as string, // Cast from Stripe.StripePaymentMethod, which is only an object when expanded.
        amount: existingInv.amount,
        currency: "usd", // <-- Note: would need to be paramaterized for i18n
        confirm: true,
        on_behalf_of: payingUser.stripeConnectAccount.id,
        transfer_data: {
          destination: payingUser.stripeConnectAccount.id,
        },
      });

      return await Invoice.updateOne(existingInv, {
        ...(paymentIntent.status === "succeeded" && { status: "CLOSED" }),
        stripePaymentIntentID: paymentIntent.id,
      });
    },
    deleteInvoice: async (parent, { invoiceID }, { user }) => {
      const existingInv = await Invoice.queryInvoiceByID(invoiceID);

      if (!existingInv) throw new GqlUserInputError("Invoice not found.");
      if (existingInv.createdByUserID !== user.id) throw new GqlForbiddenError("Access denied.");
      if (existingInv.status !== "OPEN")
        throw new GqlForbiddenError(`Cannot delete a ${existingInv.status} invoice.`);

      const deletedInvoice = await Invoice.deleteOne(existingInv);

      return new DeleteMutationResponse({
        id: deletedInvoice.id,
        wasDeleted: true,
      });
    },
  },
  Invoice: {
    createdBy: async (parent, args, { user }) => {
      return parent.createdByUserID === user.id
        ? { __typename: "User", ...user }
        : ({
            __typename: "Contact",
            ...(await User.getUserByID(parent.createdByUserID)),
          } as any); // FIXME
    },
    assignedTo: async (parent, args, { user }) => {
      return parent.assignedToUserID === null || !parent.assignedToUserID
        ? null
        : parent.assignedToUserID === user.id
        ? { __typename: "User", ...user }
        : ({
            __typename: "Contact",
            ...(await User.getUserByID(parent.assignedToUserID)),
          } as any); // FIXME
    },
  },
};
