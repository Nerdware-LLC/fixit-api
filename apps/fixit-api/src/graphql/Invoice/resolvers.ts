import { DeleteMutationResponse } from "@/graphql/_responses/index.js";
import { invoiceModelHelpers } from "@/models/Invoice/helpers.js";
import { User } from "@/models/User";
import { WorkOrder } from "@/models/WorkOrder";
import { InvoiceService } from "@/services/InvoiceService";
import { UserInputError } from "@/utils/httpErrors.js";
import { createInvoiceZodSchema } from "./helpers.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  Query: {
    invoice: async (_parent, { invoiceID }) => {
      // Sanitize the provided invoiceID
      invoiceID = invoiceModelHelpers.id.sanitizeAndValidate(invoiceID);

      return await InvoiceService.findInvoiceByID({ invoiceID });
    },
    myInvoices: async (_parent, _args, { user }) => {
      return await InvoiceService.queryUsersInvoices({ authenticatedUser: user });
    },
  },
  Mutation: {
    createInvoice: async (_parent, { invoice: invoiceInput }, { user }) => {
      // Sanitize and validate the provided invoiceInput
      invoiceInput = createInvoiceZodSchema.parse(invoiceInput);

      return await InvoiceService.createInvoice({
        createdByUserID: user.id,
        ...invoiceInput,
      });
    },
    updateInvoiceAmount: async (_parent, { invoiceID, amount }, { user }) => {
      // Sanitize the provided invoiceID
      invoiceID = invoiceModelHelpers.id.sanitizeAndValidate(invoiceID);
      // Validate the provided amount
      if (!invoiceModelHelpers.amount.isValid(amount))
        throw new UserInputError(`Invalid value for field: "amount"`);

      return await InvoiceService.updateInvoiceAmount({
        invoiceID,
        amount,
        authenticatedUser: user,
      });
    },
    payInvoice: async (_parent, { invoiceID }, { user }) => {
      // Sanitize the provided invoiceID
      invoiceID = invoiceModelHelpers.id.sanitizeAndValidate(invoiceID);

      return await InvoiceService.payInvoice({ invoiceID, authenticatedUser: user });
    },
    deleteInvoice: async (_parent, { invoiceID }, { user }) => {
      // Sanitize the provided invoiceID
      invoiceID = invoiceModelHelpers.id.sanitizeAndValidate(invoiceID);

      const deletedInvoice = await InvoiceService.deleteInvoice({
        invoiceID,
        authenticatedUser: user,
      });

      return new DeleteMutationResponse({
        id: deletedInvoice.id,
        success: true,
      });
    },
  },
  Invoice: {
    createdBy: async ({ createdByUserID }, _args, { user }) => {
      if (createdByUserID === user.id) return user;

      const createdByUser = await User.getItem({ id: createdByUserID });

      return createdByUser!;
    },
    assignedTo: async ({ assignedToUserID }, _args, { user }) => {
      if (assignedToUserID === user.id) return user;

      const assignedToUser = await User.getItem({ id: assignedToUserID });

      return assignedToUser!;
    },
    workOrder: async ({ workOrderID }, _args) => {
      if (!workOrderID) return null;

      const [workOrder] = await WorkOrder.query({ where: { id: workOrderID }, limit: 1 });

      return workOrder ?? null;
    },
  },
};
