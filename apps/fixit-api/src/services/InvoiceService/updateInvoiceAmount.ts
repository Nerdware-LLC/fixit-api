import { eventEmitter } from "@/events/eventEmitter.js";
import { Invoice } from "@/models/Invoice";
import { AuthService } from "@/services/AuthService";
import { UserInputError } from "@/utils/httpErrors.js";
import type { MutationUpdateInvoiceAmountArgs } from "@/types/graphql.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * ### InvoiceService - updateInvoiceAmount
 */
export const updateInvoiceAmount = async ({
  invoiceID,
  amount,
  authenticatedUser,
}: MutationUpdateInvoiceAmountArgs & { authenticatedUser: AuthTokenPayload }) => {
  const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

  if (!existingInv) throw new UserInputError("An invoice with the provided ID could not be found.");

  AuthService.verifyUserIsAuthorized.toPerformThisUpdate(existingInv, {
    idOfUserWhoCanPerformThisUpdate: existingInv.createdByUserID,
    authenticatedUserID: authenticatedUser.id,
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
};
