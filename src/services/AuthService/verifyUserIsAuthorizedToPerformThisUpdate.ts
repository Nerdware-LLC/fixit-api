import { hasKey } from "@nerdware/ts-type-safety-utils";
import { ForbiddenError } from "@/utils/httpErrors.js";

/**
 * This function performs the following common authorization validation checks for
 * update-mutations involving an item with a `status` field (e.g., `WorkOrder` and
 * `Invoice`):
 *
 * 1. Ensures the authenticated user is allowed to perform the update
 * 2. Ensures the item's existing `status` does not forbid the update
 */
export function verifyUserIsAuthorizedToPerformThisUpdate<
  ItemWithStatus extends { status: string },
>(
  item: ItemWithStatus,
  {
    idOfUserWhoCanPerformThisUpdate: allowedUserID,
    authenticatedUserID: userID,
    forbiddenStatuses,
  }: VeritfyUserIsAuthorizedParams<ItemWithStatus>
) {
  // Ensure the authenticated user is allowed to perform the update
  if (allowedUserID !== userID) {
    throw new ForbiddenError("Access denied.");
  }
  // Ensure the item's existing `status` does not forbid the update
  if (forbiddenStatuses && hasKey(forbiddenStatuses, item.status)) {
    throw new ForbiddenError(forbiddenStatuses[item.status as keyof typeof forbiddenStatuses]);
  }
}

/**
 * Validation parameters for controlling the behavior of {@link verifyUserCanPerformThisUpdate}.
 */
export type VeritfyUserIsAuthorizedParams<
  ItemWithStatus extends { status: string } = { status: string },
> = {
  idOfUserWhoCanPerformThisUpdate: string | null | undefined;
  authenticatedUserID: string;
  forbiddenStatuses?: ForbiddenStatusErrorMessages<ItemWithStatus>;
};

/**
 * A map of forbidden item statuses to error messages. The included keys must
 * reflect statuses which are forbidden for a given update mutation.
 */
export type ForbiddenStatusErrorMessages<
  ItemWithStatus extends { status: string } = { status: string },
> = { [Status in ItemWithStatus["status"]]?: string };
