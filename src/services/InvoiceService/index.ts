import { createInvoice } from "./createInvoice.js";
import { deleteInvoice } from "./deleteInvoice.js";
import { findInvoiceByID } from "./findInvoiceByID.js";
import { payInvoice } from "./payInvoice.js";
import { queryUsersInvoices } from "./queryUsersInvoices.js";
import { updateInvoiceAmount } from "./updateInvoiceAmount.js";

/**
 * #### InvoiceService
 *
 * This object contains methods which implement business logic for Invoice operations.
 */
export const InvoiceService = {
  createInvoice,
  deleteInvoice,
  findInvoiceByID,
  payInvoice,
  queryUsersInvoices,
  updateInvoiceAmount,
} as const;
