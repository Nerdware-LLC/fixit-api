import moment from "moment";
import {
  Model,
  type ItemTypeFromSchema,
  type ItemInputType,
  type ModelSchemaOptions,
} from "@lib/dynamoDB";
import { Location } from "@models/Location";
import { USER_ID_REGEX } from "@models/User/regex";
import { COMMON_ATTRIBUTE_TYPES, COMMON_ATTRIBUTES, type FixitUserFields } from "@models/_common";
import { ddbSingleTable } from "@models/ddbSingleTable";
import { createOne } from "./createOne";
import { ENUM_CONSTANTS } from "./enumConstants";
import {
  WORK_ORDER_SK_PREFIX_STR as WO_SK_PREFIX,
  WORK_ORDER_ID_REGEX as WO_ID_REGEX,
  WO_CHECKLIST_ITEM_ID_REGEX,
} from "./regex";
import { updateOne } from "./updateOne";
import type { OverrideProperties } from "type-fest";

/**
 * WorkOrder DdbSingleTable Model
 */
class WorkOrderModel extends Model<
  typeof WorkOrderModel.schema,
  WorkOrderModelItem,
  WorkOrderModelInput
> {
  static readonly STATUSES = ENUM_CONSTANTS.STATUSES;
  static readonly PRIORITIES = ENUM_CONSTANTS.PRIORITIES;
  static readonly CATEGORIES = ENUM_CONSTANTS.CATEGORIES;
  static readonly SK_PREFIX = WO_SK_PREFIX;

  static readonly getFormattedID = (createdByUserID: string, createdAt: moment.MomentInput) => {
    return `${WO_SK_PREFIX}#${createdByUserID}#${moment(createdAt).unix()}`;
  };

  static readonly isValidID = (value?: unknown) => {
    return typeof value === "string" && WO_ID_REGEX.test(value);
  };

  static readonly schema = {
    pk: {
      type: "string",
      alias: "createdByUserID",
      validate: (value: string) => USER_ID_REGEX.test(value),
      required: true,
    },
    sk: {
      type: "string",
      alias: "id",
      default: (woItem: { pk: string; createdAt: Date }) =>
        WorkOrderModel.getFormattedID(woItem.pk, woItem.createdAt),
      validate: (value: string) => WO_ID_REGEX.test(value),
      required: true,
    },
    data: {
      type: "string",
      alias: "assignedToUserID",
      default: "UNASSIGNED",
      validate: (value: string) => value === "UNASSIGNED" || USER_ID_REGEX.test(value),
      required: true,
      transformValue: {
        /* `data` can't be null on an index-pk, but `assignedTo` is nullable in the GQL schema,
        hence the placeholder "UNASSIGNED". This fn converts it to null on read fromDB.      */
        fromDB: (value: string) => (value === "UNASSIGNED" ? null : value),
      },
    },
    status: {
      type: "enum",
      oneOf: WorkOrderModel.STATUSES,
      required: true,
    },
    priority: {
      type: "enum",
      oneOf: WorkOrderModel.PRIORITIES,
      default: "NORMAL",
      required: true,
    },
    location: {
      type: "string", // [COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]
      validate: (value: string) => Location.validateCompoundString(value),
      required: true,
      transformValue: {
        /* Clients provide "location" as an object with properties "country", "region", "city",
        "streetLine1", and "streetLine2". This transformation converts these client location input
        objects into a string which adheres to the above pattern and serves as a composite attribute
        value. Storing "location" in this way makes it possible to flexibly query the DynamoDB db
        for access patterns like "Find all work orders on Foo Street".  */
        toDB: (location: Location) => Location.convertToCompoundString(location),
        // This fromDB reverses the toDB, returning a "location" object from db format.
        fromDB: (locationCompoundStr: string) => Location.parseCompoundString(locationCompoundStr),
      },
    },
    category: {
      type: "enum",
      oneOf: WorkOrderModel.CATEGORIES,
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
              default: (woItem: { sk: string }) => `${woItem.sk}#CHECKLIST_ITEM#${moment().unix()}`,
              validate: (value: string) => WO_CHECKLIST_ITEM_ID_REGEX.test(value),
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
  } as const;

  // prettier-ignore
  static readonly schemaOptions: ModelSchemaOptions = {
    // This validateItem fn ensures WOs can not be assigned to the createdBy user
    validateItem: ({ pk: createdByUserID, data: assignedToUserID }) => createdByUserID !== assignedToUserID,
    transformItem: {
      /* fromDB, string fields `pk` (createdByUserID) and `data` (assignedToUserID) are converted
      into GQL-API fields `createdBy` and `assignedTo`. Note that while `assignedTo` CAN BE null
      in the GQL-API schema, `data` is an index-pk and therefore CAN'T BE null in the db, so a
      placeholder-constant of "UNASSIGNED" is used in the db. So along with converting the keys,
      this fn also converts the "UNASSIGNED" placeholder to null on read. */
      fromDB: ({ pk: createdByUserID, data: assignedToUserID, ...woItem }: { pk: string; data: string }) => ({
        createdBy: { id: createdByUserID },
        assignedTo: assignedToUserID === "UNASSIGNED" ? null : { id: assignedToUserID },
        ...woItem,
      }),
    },
    // These properties are added by transformItem, so they must be allow-listed:
    allowUnknownAttributes: ["createdBy", "assignedTo"],
  };

  constructor() {
    super("WorkOrder", WorkOrderModel.schema, {
      ...WorkOrderModel.schemaOptions,
      ...ddbSingleTable,
    });
  }

  // WORK ORDER MODEL — Instance properties and methods:

  readonly PRIORITIES = WorkOrderModel.PRIORITIES;
  readonly STATUSES = WorkOrderModel.STATUSES;
  readonly CATEGORIES = WorkOrderModel.CATEGORIES;
  readonly SK_PREFIX = WorkOrderModel.SK_PREFIX;
  readonly getFormattedID = WorkOrderModel.getFormattedID;
  readonly isValidID = WorkOrderModel.isValidID;
  readonly createOne = createOne;
  readonly updateOne = updateOne;
}

export const WorkOrder = new WorkOrderModel();

export type WorkOrderModelItem = OverrideProperties<
  FixitUserFields<ItemTypeFromSchema<typeof WorkOrderModel.schema>>,
  { location: Location }
>;
export type WorkOrderModelInput = OverrideProperties<
  ItemInputType<typeof WorkOrderModel.schema>,
  { location: Location }
>;
