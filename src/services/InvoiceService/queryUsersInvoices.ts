import { Invoice } from "@/models/Invoice";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * ### InvoiceService: queryUsersInvoices
 */
export const queryUsersInvoices = async ({
  authenticatedUser,
}: {
  authenticatedUser: AuthTokenPayload;
}) => {
  return {
    // Query for all Invoices created by the authenticated User
    createdByUser: await Invoice.query({
      where: {
        createdByUserID: authenticatedUser.id,
        id: { beginsWith: Invoice.SK_PREFIX },
      },
    }),
    // Query for all Invoices assigned to the authenticated User
    assignedToUser: await Invoice.query({
      where: {
        assignedToUserID: authenticatedUser.id,
        id: { beginsWith: Invoice.SK_PREFIX },
      },
    }),
  };
};
