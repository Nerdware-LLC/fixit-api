import type { Except } from "type-fest";

/**
 * This generic takes an item with properties `createdByUserID` and
 * `assignedToUserID` and returns a new type with those properties
 * replaced by `createdBy` and `assignedTo` objects.
 */
export type FixitUserFields<T extends { createdByUserID: string; assignedToUserID?: string }> =
  Except<T, "createdByUserID" | "assignedToUserID"> & {
    createdBy: { id: string };
    assignedTo: T extends { assignedToUserID: string } ? { id: string } : { id: string } | null;
  };
