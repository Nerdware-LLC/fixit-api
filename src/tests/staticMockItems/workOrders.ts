import { Location } from "@/models/Location";
import { workOrderModelHelpers as woModelHelpers } from "@/models/WorkOrder/helpers";
import { MOCK_DATES, MOCK_DATE_v1_UUIDs as UUIDs } from "./dates";
import { MOCK_USERS } from "./users";
import type { WorkOrderItem, UnaliasedWorkOrderItem } from "@/models/WorkOrder";
import type { MocksCollection } from "./_types";

const { USER_A, USER_B, USER_C } = MOCK_USERS;

export const MOCK_WORK_ORDERS: MocksCollection<"WO", WorkOrderItem> = {
  /** [MOCK WO] createdBy: `USER_A`, assignedTo: `null`, status: `"UNASSIGNED"` */
  WO_A: {
    id: woModelHelpers.id.format(USER_A.id, UUIDs.MAY_1_2020),
    createdByUserID: USER_A.id,
    assignedToUserID: null,
    status: "UNASSIGNED",
    priority: "LOW",
    location: {
      country: "USA",
      region: "Washington",
      city: "Redmond",
      streetLine1: "1 Microsoft Way",
      streetLine2: null,
    },
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
    id: woModelHelpers.id.format(USER_B.id, UUIDs.MAY_1_2020),
    createdByUserID: USER_B.id,
    assignedToUserID: USER_A.id,
    status: "ASSIGNED",
    priority: "HIGH",
    location: {
      country: "USA",
      region: "California",
      city: "Mountain View",
      streetLine1: "1600 Amphitheatre Parkway",
      streetLine2: "Attn: #Human Googlers", // <-- tests chars :#
    },
    category: "GENERAL",
    description: "Do cool things at the Googleplex",
    checklist: [
      {
        id: woModelHelpers.checklistItemID.format(
          woModelHelpers.id.format(USER_B.id, UUIDs.MAY_1_2020),
          UUIDs.MAY_1_2020
        ),
        description: "Do a cool thing",
        isCompleted: false,
      },
      {
        id: woModelHelpers.checklistItemID.format(
          woModelHelpers.id.format(USER_B.id, UUIDs.MAY_1_2020),
          UUIDs.MAY_2_2020
        ),
        description: "Engineer all the things",
        isCompleted: false,
      },
      {
        id: woModelHelpers.checklistItemID.format(
          woModelHelpers.id.format(USER_B.id, UUIDs.MAY_1_2020),
          UUIDs.MAY_3_2020
        ),
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
    id: woModelHelpers.id.format(USER_C.id, UUIDs.MAY_1_2020),
    createdByUserID: USER_C.id,
    assignedToUserID: USER_A.id,
    status: "COMPLETE",
    priority: "NORMAL",
    location: {
      country: "USA",
      region: "California",
      city: "San Francisco",
      streetLine1: "3180 18th Street",
      streetLine2: null,
    },
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
};

/** Unaliased mock WorkOrders for mocking `@aws-sdk/lib-dynamodb` responses. */
export const UNALIASED_MOCK_WORK_ORDERS = Object.fromEntries(
  Object.entries(MOCK_WORK_ORDERS).map(
    ([key, { id, createdByUserID, assignedToUserID, location, ...workOrder }]) => [
      key,
      {
        pk: createdByUserID,
        sk: id,
        data: assignedToUserID ?? "UNASSIGNED",
        location: Location.convertToCompoundString(location),
        ...workOrder,
      },
    ]
  )
) as MocksCollection<"WO", UnaliasedWorkOrderItem>;
