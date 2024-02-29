import { hasKey } from "@nerdware/ts-type-safety-utils";
import { GqlUserInputError, GqlForbiddenError } from "@/utils/httpErrors.js";

/**
 * This function performs the following common authorization validation checks for
 * update-mutations involving an item with a `status` field (e.g., `WorkOrder` and
 * `Invoice`):
 *
 * 1. Ensures the item exists
 * 2. Ensures the authenticated user is allowed to perform the update
 * 3. Ensures the item's existing `status` does not forbid the update
 */
export function verifyUserIsAuthorizedToPerformThisUpdate<
  ItemWithStatus extends { status: string },
>(
  item: ItemWithStatus | undefined,
  {
    itemNotFoundErrorMessage,
    idOfUserWhoCanPerformThisUpdate: allowedUserID,
    authenticatedUserID: userID,
    forbiddenStatuses,
  }: GqlValidationParams<ItemWithStatus>
): asserts item is NonNullable<ItemWithStatus> {
  // Ensure the item exists
  if (!item) {
    throw new GqlUserInputError(itemNotFoundErrorMessage);
  }
  // Ensure the authenticated user is allowed to perform the update
  if (allowedUserID !== userID) {
    throw new GqlForbiddenError("Access denied.");
  }
  // Ensure the item's existing `status` does not forbid the update
  if (forbiddenStatuses && hasKey(forbiddenStatuses, item.status)) {
    throw new GqlForbiddenError(forbiddenStatuses[item.status as keyof typeof forbiddenStatuses]);
  }
}

/**
 * Validation parameters for controlling the behavior of {@link verifyUserCanPerformThisUpdate}.
 */
export type GqlValidationParams<ItemWithStatus extends { status: string } = { status: string }> = {
  itemNotFoundErrorMessage: string;
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
