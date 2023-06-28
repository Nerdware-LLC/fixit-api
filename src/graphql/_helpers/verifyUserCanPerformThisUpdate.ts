import { GqlUserInputError, GqlForbiddenError } from "@utils";
import type { InvoiceModelItem } from "@models/Invoice";
import type { WorkOrderModelItem } from "@models/WorkOrder";

/**
 * This function performs the following common validation checks for WorkOrder
 * and Invoice update-mutations:
 *
 * 1. Ensures the item exists
 * 2. Ensures the authenticated user is allowed to perform the update
 * 3. Ensures the item's existing `status` does not forbid the update
 */
export const verifyUserCanPerformThisUpdate = <TItem extends WorkOrderModelItem | InvoiceModelItem>(
  item: TItem,
  {
    idOfUserWhoCanPerformThisUpdate: allowedID,
    authenticatedUserID: userID,
    forbiddenStatuses,
  }: {
    idOfUserWhoCanPerformThisUpdate: string;
    authenticatedUserID: string;
    forbiddenStatuses?: Partial<Record<TItem["status"], string>>;
  }
) => {
  // Ensure the item exists
  if (!item) {
    throw new GqlUserInputError(`${"amount" in item ? "Invoice" : "Work Order"} not found.`);
  }
  // Ensure the authenticated user is allowed to perform the update
  if (allowedID !== userID) {
    throw new GqlForbiddenError("Access denied.");
  }
  // Ensure the item's existing `status` does not forbid the update
  if (forbiddenStatuses && item.status in forbiddenStatuses) {
    throw new GqlForbiddenError(forbiddenStatuses[item.status as TItem["status"]]);
  }
};
