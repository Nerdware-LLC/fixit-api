import type { ModelSchemaOptions } from "@/lib/dynamoDB";

/**
 * Common ModelSchemaOptions
 */
export const COMMON_SCHEMA_OPTS = {
  /**
   * This function returns a {@link ModelSchemaOptions} object for items with `createdBy`
   * and `assignedTo` User fields (WorkOrders and Invoices).
   * @param isAssigneeRequired - If true, the `assignedTo` field is required and non-nullable.
   */
  getOptsForItemWithCreatedByAndAssignedTo: (isAssigneeRequired: boolean): ModelSchemaOptions => ({
    /**
     * This validateItem fn ensures `createdByUserID` !== `assignedToUserID`
     */
    validateItem: ({ pk, data }) => pk !== data,
    /**
     * fromDB, string fields `pk` (createdByUserID) and `data` (assignedToUserID) are
     * converted into GQL-API fields `createdBy` and `assignedTo`.
     *
     * NOTE: For WorkOrders, while `assignedTo` CAN BE null in the GQL-API schema, `data`
     * is an index-pk and therefore CAN'T BE null in the db, so a placeholder-constant of
     * "UNASSIGNED" is used in the db. So along with converting the keys, this fn also
     * converts the "UNASSIGNED" placeholder to null on read.
     */
    transformItem: {
      fromDB: ({
        pk: createdByUserID,
        data: assignedToUserID,
        ...woItem
      }: {
        pk: string;
        data: string;
      }) => ({
        createdBy: { id: createdByUserID },
        assignedTo:
          isAssigneeRequired === false && (!assignedToUserID || assignedToUserID === "UNASSIGNED")
            ? null
            : { id: assignedToUserID },
        ...woItem,
      }),
    },
    /**
     * These properties are added by transformItem, so they must be allow-listed.
     */
    allowUnknownAttributes: ["createdBy", "assignedTo"] satisfies string[],
  }),
} as const;
