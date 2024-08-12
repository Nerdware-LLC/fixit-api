import { eventEmitter } from "@/events/eventEmitter.js";
import { stripe } from "@/lib/stripe/stripeClient.js";
import { Invoice } from "@/models/Invoice";
import { AuthService } from "@/services/AuthService";
import { UserInputError, ForbiddenError } from "@/utils/httpErrors.js";
import type { AuthTokenPayload } from "@/types/open-api.js";

/**
 * ### InvoiceService - payInvoice
 */
export const payInvoice = async ({
  invoiceID,
  authenticatedUser,
}: {
  invoiceID: string;
  authenticatedUser: AuthTokenPayload;
}) => {
  // Fetch the Invoice
  const [existingInv] = await Invoice.query({ where: { id: invoiceID }, limit: 1 });

  if (!existingInv) throw new UserInputError("An invoice with the provided ID could not be found.");

  AuthService.verifyUserIsAuthorized.toPerformThisUpdate(existingInv, {
    idOfUserWhoCanPerformThisUpdate: existingInv.assignedToUserID,
    authenticatedUserID: authenticatedUser.id,
    forbiddenStatuses: {
      CLOSED: "The requested invoice has already been closed.",
      DISPUTED: "The requested invoice has been disputed and cannot be paid at this time.",
    },
  });

  // Fetch the Stripe Customer
  const stripeCustomer = await stripe.customers.retrieve(authenticatedUser.stripeCustomerID);

  // Ensure the user hasn't removed themselves as a Stripe Customer
  if (stripeCustomer.deleted) {
    throw new ForbiddenError(
      "Invalid Stripe Customer - please review your payment settings in your Stripe Dashboard and try again."
    );
  }

  const paymentIntent = await stripe.paymentIntents.create({
    customer: authenticatedUser.stripeCustomerID,
    payment_method: stripeCustomer.invoice_settings.default_payment_method as string, // Cast from Stripe.StripePaymentMethod, which is only an object when expanded.
    amount: existingInv.amount,
    currency: "usd", // <-- Note: would need to be paramaterized for i18n
    confirm: true,
    on_behalf_of: authenticatedUser.stripeConnectAccount.id,
    transfer_data: {
      destination: authenticatedUser.stripeConnectAccount.id,
    },
  });

  const wasInvoiceSuccessfullyPaid = paymentIntent.status === "succeeded";

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
};
