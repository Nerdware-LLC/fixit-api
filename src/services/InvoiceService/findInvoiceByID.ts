import { Invoice } from "@/models/Invoice";
import { UserInputError } from "@/utils/httpErrors.js";

/**
 * ### InvoiceService: findInvoiceByID
 */
export const findInvoiceByID = async ({ invoiceID }: { invoiceID: string }) => {
  const [existingInv] = await Invoice.query({
    where: { id: invoiceID },
    limit: 1,
  });

  if (!existingInv) throw new UserInputError("An invoice with the provided ID could not be found.");

  return existingInv;
};
