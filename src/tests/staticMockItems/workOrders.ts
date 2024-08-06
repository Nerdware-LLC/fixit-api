import { sanitizePhone } from "@nerdware/ts-string-helpers";
import { Location } from "@/models/Location";
import { workOrderModelHelpers as woModelHelpers } from "@/models/WorkOrder/helpers.js";
import { MOCK_DATES } from "./dates.js";
import { MOCK_USERS } from "./users.js";
import type { WorkOrderItem, UnaliasedWorkOrderItem } from "@/models/WorkOrder";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

const WO_IDS = {
  WO_A: woModelHelpers.id.format(USER_A.id),
  WO_B: woModelHelpers.id.format(USER_B.id),
  WO_C: woModelHelpers.id.format(USER_C.id),
} as const;

export const MOCK_WORK_ORDERS = {
  /** [MOCK WO] createdBy: `USER_A`, assignedTo: `null`, status: `"UNASSIGNED"` */
  WO_A: {
    id: WO_IDS.WO_A,
    createdByUserID: USER_A.id,
    assignedToUserID: null,
    status: "UNASSIGNED",
    priority: "LOW",
    location: new Location({
      country: "USA",
      region: "Washington",
      city: "Redmond",
      streetLine1: "1 Microsoft Way",
      streetLine2: null,
    }),
    category: null,
    description: null,
    checklist: null,
    entryContact: null,
    entryContactPhone: null,
    dueDate: null,
    scheduledDateTime: null,
    contractorNotes: null,
    createdAt: MOCK_DATES.MAY_1_2020,
    updatedAt: MOCK_DATES.MAY_1_2020,
  },
  /** [MOCK WO] createdBy: `USER_B`, assignedTo: `USER_A`, status: `"ASSIGNED"` */
  WO_B: {
    id: WO_IDS.WO_B,
    createdByUserID: USER_B.id,
    assignedToUserID: USER_A.id,
    status: "ASSIGNED",
    priority: "HIGH",
    location: new Location({
      country: "USA",
      region: "California",
      city: "Mountain View",
      streetLine1: "1600 Amphitheatre Parkway",
      streetLine2: "Attn: #Human Googlers", // <-- tests chars :#
    }),
    category: "GENERAL",
    description: "Do cool things at the Googleplex",
    checklist: [
      {
        id: woModelHelpers.checklistItemID.format(WO_IDS.WO_B),
        description: "Do a cool thing",
        isCompleted: false,
      },
      {
        id: woModelHelpers.checklistItemID.format(WO_IDS.WO_B),
        description: "Engineer all the things",
        isCompleted: false,
      },
      {
        id: woModelHelpers.checklistItemID.format(WO_IDS.WO_B),
        description: "Pet a doggo",
        isCompleted: false,
      },
    ],
    entryContact: "Sundar Pichai",
    entryContactPhone: "(555) 123-4567",
    dueDate: MOCK_DATES.JAN_1_2021,
    scheduledDateTime: MOCK_DATES.MAY_3_2020,
    contractorNotes: null,
    createdAt: MOCK_DATES.MAY_1_2020,
    updatedAt: MOCK_DATES.MAY_1_2020,
  },
  /** [MOCK WO] createdBy: `USER_C`, assignedTo: `USER_A`, status: `"COMPLETE"` */
  WO_C: {
    id: WO_IDS.WO_C,
    createdByUserID: USER_C.id,
    assignedToUserID: USER_A.id,
    status: "COMPLETE",
    priority: "NORMAL",
    location: new Location({
      country: "USA",
      region: "California",
      city: "San Francisco",
      streetLine1: "3180 18th Street",
      streetLine2: null,
    }),
    category: null,
    description: null,
    checklist: null,
    entryContact: null,
    entryContactPhone: null,
    dueDate: null,
    scheduledDateTime: null,
    contractorNotes: null,
    createdAt: MOCK_DATES.MAY_1_2020,
    updatedAt: MOCK_DATES.MAY_1_2020,
  },
} as const satisfies Record<string, WorkOrderItem>;

/** Unaliased mock WorkOrders for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_WORK_ORDERS = Object.fromEntries(
  Object.entries(MOCK_WORK_ORDERS).map(
    ([
      key,
      { id, createdByUserID, assignedToUserID, location, entryContactPhone, ...workOrder },
    ]) => [
      key,
      {
        pk: createdByUserID,
        sk: id,
        data: assignedToUserID ?? "UNASSIGNED",
        location: Location.convertToCompoundString(location),
        entryContactPhone: entryContactPhone ? sanitizePhone(entryContactPhone) : entryContactPhone,
        ...workOrder,
      },
    ]
  )
) as { [Key in keyof typeof MOCK_WORK_ORDERS]: UnaliasedWorkOrderItem };
