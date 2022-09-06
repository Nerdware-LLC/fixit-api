import { UserInputError, ForbiddenError } from "apollo-server-express";
import { Invoice, User } from "@models";
import { stripe } from "@lib/stripe";

export const resolvers = {
  Query: {
    invoice: async (parent, { invoiceID }) => {
      return await Invoice.queryInvoiceByID(invoiceID);
    },
    myInvoices: async (parent, args, { user }) => {
      return await Invoice.queryUserInvoices(user.id);
    }
  },
  Mutation: {
    createInvoice: async (parent, { invoice: invoiceInput }, { user }) => {
      return await Invoice.createOne({
        createdByUserID: user.id,
        assignedToUserID: invoiceInput.assignedToUserID,
        amount: invoiceInput.amount,
        workOrderID: invoiceInput?.workOrderID ?? null
      });
    },
    updateInvoiceAmount: async (parent, { invoiceID, amount }, { user }) => {
      const existingInv = await Invoice.getInvoiceByID(invoiceID);

      if (!existingInv) throw new UserInputError("Invoice not found.");
      if (existingInv.createdByUserID !== user.id) throw new ForbiddenError("Access denied.");
      if (existingInv.status !== "OPEN")
        throw new ForbiddenError(`Cannot modify a ${existingInv.status} invoice.`);

      return await Invoice.updateOne(existingInv, { amount });
    },
    payInvoice: async (parent, { invoiceID }, { user }) => {
      // TODO Maybe add "assigneeUserDefaultPaymentMethodID" to Invoice - reduce queries.
      const existingInv = await Invoice.getInvoiceByID(invoiceID);

      if (!existingInv) throw new UserInputError("Invoice not found.");
      if (existingInv.assignedToUserID !== user.id) throw new ForbiddenError("Access denied.");
      if (existingInv.status !== "OPEN")
        throw new ForbiddenError(`Cannot pay a ${existingInv.status} invoice.`);

      // TODO after default_payment_method is added to db, remove 1 or both of these lines.
      const payingUser = await User.getUserByID(existingInv.assignedToUserID);
      const stripeCustomer = await stripe.customers.retrieve(payingUser.stripeCustomerID);

      const paymentIntent = await stripe.paymentIntents.create({
        customer: payingUser.stripeCustomerID,
        payment_method: stripeCustomer.invoice_settings.default_payment_method,
        amount: existingInv.amount,
        currency: "usd", // <-- Note: would need to be paramaterized for i18n
        confirm: true,
        on_behalf_of: payingUser.stripeConnectAccountID,
        transfer_data: {
          destination: payingUser.stripeConnectAccountID
        }
      });

      return await Invoice.updateOne(existingInv, {
        ...(paymentIntent.status === "succeeded" && { status: "CLOSED" }),
        stripePaymentIntentID: paymentIntent.id
      });
    },
    deleteInvoice: async (parent, { invoiceID }, { user }) => {
      const existingInv = await Invoice.getInvoiceByID(invoiceID);

      if (!existingInv) throw new UserInputError("Invoice not found.");
      if (existingInv.createdByUserID !== user.id) throw new ForbiddenError("Access denied.");
      if (existingInv.status !== "OPEN")
        throw new ForbiddenError(`Cannot delete a ${existingInv.status} invoice.`);

      return await Invoice.deleteOne(existingInv);
    }
  }
};
