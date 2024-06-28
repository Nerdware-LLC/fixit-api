import { Model } from "@nerdware/ddb-single-table";
import { isString } from "@nerdware/ts-type-safety-utils";
import { Location } from "@/models/Location";
import { userModelHelpers } from "@/models/User/helpers.js";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES } from "@/models/_common/modelAttributes.js";
import { ddbTable } from "@/models/ddbTable.js";
import { WORK_ORDER_ENUM_CONSTANTS } from "./enumConstants.js";
import { workOrderModelHelpers as woModelHelpers, WO_SK_PREFIX_STR } from "./helpers.js";
import type {
  ItemTypeFromSchema,
  ItemCreationParameters,
  ModelSchemaOptions,
} from "@nerdware/ddb-single-table";
import type { OverrideProperties } from "type-fest";

/**
 * WorkOrder Model
 */
class WorkOrderModel extends Model<
  typeof WorkOrderModel.schema,
  WorkOrderItem,
  WorkOrderItemCreationParams
> {
  static readonly schema = ddbTable.getModelSchema({
    pk: {
      type: "string",
      alias: "createdByUserID",
      validate: userModelHelpers.id.isValid,
      required: true,
    },
    sk: {
      type: "string",
      alias: "id",
      default: ({ pk: createdByUserID }: { pk?: string }) =>
        createdByUserID ? woModelHelpers.id.format(createdByUserID) : undefined,
      validate: woModelHelpers.id.isValid,
      required: true,
    },
    data: {
      type: "string",
      alias: "assignedToUserID",
      default: "UNASSIGNED",
      validate: (value: string) => value === "UNASSIGNED" || userModelHelpers.id.isValid(value),
      required: true,
      transformValue: {
        /* `data` can't be null on an index-pk, but `assignedTo` is nullable
        in the GQL schema, hence the placeholder "UNASSIGNED". */
        toDB: (value?: unknown) => (isString(value) ? value : "UNASSIGNED"),
        fromDB: (value: string) => (value === "UNASSIGNED" ? null : value),
      },
    },
    status: {
      type: "enum",
      oneOf: WORK_ORDER_ENUM_CONSTANTS.STATUSES,
      required: true,
    },
    priority: {
      type: "enum",
      oneOf: WORK_ORDER_ENUM_CONSTANTS.PRIORITIES,
      default: "NORMAL",
      required: true,
    },
    location: {
      type: "string", // [COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]
      validate: (value: string) => Location.validateCompoundString(value),
      required: true,
      transformValue: {
        toDB: (location: Location) => Location.convertToCompoundString(location),
        fromDB: (locationCompoundStr: string) => Location.parseCompoundString(locationCompoundStr),
      },
    },
    category: {
      type: "enum",
      oneOf: WORK_ORDER_ENUM_CONSTANTS.CATEGORIES,
      required: false,
    },
    description: {
      type: "string",
      required: false,
    },
    checklist: {
      type: "array",
      required: false,
      schema: [
        {
          type: "map",
          schema: {
            id: {
              type: "string",
              default: (wo: { sk: string }) => woModelHelpers.checklistItemID.format(wo.sk),
              validate: woModelHelpers.checklistItemID.isValid,
              required: true,
            },
            description: { type: "string", required: true },
            isCompleted: { type: "boolean", required: true, default: false },
          },
        },
      ],
    },
    entryContact: {
      type: "string",
      required: false,
    },
    entryContactPhone: {
      ...COMMON_ATTRIBUTE_TYPES.PHONE,
      required: false,
    },
    dueDate: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      required: false,
    },
    scheduledDateTime: {
      ...COMMON_ATTRIBUTE_TYPES.DATETIME,
      required: false,
    },
    contractorNotes: {
      type: "string",
      required: false,
    },
    ...COMMON_ATTRIBUTES.TIMESTAMPS, // "createdAt" and "updatedAt" timestamps
  } as const);

  static readonly schemaOptions: ModelSchemaOptions = {
    /** This validateItem fn ensures `createdByUserID` !== `assignedToUserID` */
    validateItem: ({ pk, data }) => pk !== data,
  };

  constructor() {
    super("WorkOrder", WorkOrderModel.schema, {
      ...WorkOrderModel.schemaOptions,
      ...ddbTable,
    });
  }

  // WORK ORDER MODEL — Instance properties and methods:
  readonly PRIORITIES = WORK_ORDER_ENUM_CONSTANTS.PRIORITIES;
  readonly STATUSES = WORK_ORDER_ENUM_CONSTANTS.STATUSES;
  readonly CATEGORIES = WORK_ORDER_ENUM_CONSTANTS.CATEGORIES;
  readonly SK_PREFIX = WO_SK_PREFIX_STR;
}

/** WorkOrder Model */
export const WorkOrder = new WorkOrderModel();

/** The shape of a `WorkOrder` object returned from WorkOrderModel methods. */
export type WorkOrderItem = OverrideProperties<
  ItemTypeFromSchema<typeof WorkOrderModel.schema>,
  { assignedToUserID: string | null; location: Location }
>;

/** `WorkOrder` item params for `createItem()`. */
export type WorkOrderItemCreationParams = OverrideProperties<
  ItemCreationParameters<typeof WorkOrderModel.schema>,
  { assignedToUserID: string | null; location: Location }
>;

/** The shape of a raw/unaliased `WorkOrder` object in the DB. */
export type UnaliasedWorkOrderItem = ItemTypeFromSchema<
  typeof WorkOrderModel.schema,
  {
    aliasKeys: false;
    optionalIfDefault: false;
    nullableIfOptional: true;
  }
>;
