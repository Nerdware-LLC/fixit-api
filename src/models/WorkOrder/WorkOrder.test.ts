import moment from "moment";
import { MILLISECONDS_PER_DAY } from "@tests/datetime";
import { WorkOrder } from "./WorkOrder";
import { WORK_ORDER_ID_REGEX, WORK_ORDER_ID_REGEX_STR } from "./regex";
import type { WorkOrderType } from "./types";

const USER_1 = "USER#11111111-1111-1111-1111-wo1111111111";
const USER_2 = "USER#22222222-2222-2222-2222-wo2222222222";
const USER_3 = "USER#33333333-3333-3333-3333-wo3333333333";

const MOCK_INPUTS = {
  // WO_A contains the bare minimum inputs for WorkOrder.createOne
  WO_A: {
    createdByUserID: USER_1,
    location: {
      region: "Washington",
      city: "Redmond",
      streetLine1: "1 Microsoft Way"
    }
  },
  // WO_B contains all WO properties that can be provided to WorkOrder.createOne
  WO_B: {
    createdByUserID: USER_2,
    assignedToUserID: USER_1,
    priority: "HIGH",
    location: {
      country: "USA",
      region: "California",
      city: "Mountain View",
      streetLine1: "1600 Amphitheatre Parkway",
      streetLine2: "Attn: #Human Googlers" // <-- tests chars :#
    },
    category: "General",
    description: "Do cool things at the Googleplex",
    checklist: [
      { description: "Did a cool thing" },
      { description: "Engineer all the things" },
      { description: "Pet a doggo" }
    ],
    dueDate: new Date(Date.now() + MILLISECONDS_PER_DAY * 10), // + 10 days
    entryContact: "Sundar Pichai",
    entryContactPhone: "(555) 123-4567",
    scheduledDateTime: new Date(Date.now() + MILLISECONDS_PER_DAY * 2) // + 2 days
  }
} as const;

// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<keyof typeof MOCK_INPUTS>;

const testWorkOrderFields = (mockInputsKey: keyof typeof MOCK_INPUTS, mockWO: WorkOrderType) => {
  const mockWOinputs = MOCK_INPUTS[mockInputsKey];

  expect(mockWO.createdByUserID).toEqual(mockWOinputs.createdByUserID);
  expect(mockWO.id).toMatch(WORK_ORDER_ID_REGEX);
  expect(mockWO.location).toEqual({ country: "USA", ...mockWOinputs.location });

  expect(moment(mockWO.createdAt).isValid()).toEqual(true);
  expect(moment(mockWO.updatedAt).isValid()).toEqual(true);

  if (mockWOinputs === MOCK_INPUTS.WO_A) {
    expect(mockWO.assignedToUserID).toEqual("UNASSIGNED");
    expect(mockWO.priority).toEqual("NORMAL");
    //
  } else if (mockWOinputs === MOCK_INPUTS.WO_B) {
    expect(mockWO.assignedToUserID).toEqual(mockWOinputs.assignedToUserID);
    expect(mockWO.description).toEqual(mockWOinputs.description);
    expect(mockWO.priority).toEqual(mockWOinputs.priority);
    expect(mockWO.category).toEqual(mockWOinputs.category);
    expect(mockWO.entryContact).toEqual(mockWOinputs.entryContact);
    expect(mockWO.entryContactPhone).toEqual(mockWOinputs.entryContactPhone);
    expect(moment(mockWO.dueDate).isValid()).toEqual(true);
    expect(moment(mockWO.scheduledDateTime).isValid()).toEqual(true);
    expect(mockWO.checklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(WORK_ORDER_ID_REGEX_STR),
          description: expect.any(String),
          isCompleted: false
        })
      ])
    );
  }
};

describe("WorkOrder model R/W database operations", () => {
  let createdWOs = {} as { -readonly [K in keyof typeof MOCK_INPUTS]: WorkOrderType };

  beforeAll(async () => {
    // Write mock WOs to Table
    for (const key of MOCK_INPUT_KEYS) {
      createdWOs[key] = await WorkOrder.createOne(MOCK_INPUTS[key]);
    }
  });

  // CREATE:

  test("WorkOrder.createOne returns expected keys and values", () => {
    Object.entries(createdWOs).forEach(([mockInputsKey, createdWO]) => {
      testWorkOrderFields(mockInputsKey as keyof typeof createdWOs, createdWO);
    });

    // TODO Ensure FixitEventEmitter triggered onWorkOrderCreated event handlers
  });

  // QUERIES:

  test("WorkOrder.queryWorkOrderByID returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const result = await WorkOrder.queryWorkOrderByID(createdWOs[key].id);
      testWorkOrderFields(key, result);
    }
  });

  test("WorkOrder.queryUsersWorkOrders returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Should be an array of 1 WorkOrder
      const workOrders = await WorkOrder.queryUsersWorkOrders(createdWOs[key].createdByUserID);
      workOrders.forEach((wo) => testWorkOrderFields(key, wo));
    }
  });

  test("WorkOrder.queryWorkOrdersAssignedToUser returns expected keys and values", async () => {
    // Should be an array of 1 WorkOrder (WO_B)
    const workOrders = await WorkOrder.queryWorkOrdersAssignedToUser(
      MOCK_INPUTS.WO_B.assignedToUserID
    );

    workOrders.forEach((wo) => {
      testWorkOrderFields("WO_B", wo);
    });
  });

  // UPDATE:

  test("WorkOrder.updateOne returns expected keys and values", async () => {
    let updatedWOs = { ...createdWOs };

    const NEW_WO_VALUES: Record<keyof typeof createdWOs, Partial<WorkOrderType>> = {
      WO_A: {
        assignedToUserID: USER_3,
        description: "Visit Google's Toronto HQ",
        location: {
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          streetLine1: "65 King East"
        }
      },
      WO_B: {
        assignedToUserID: "UNASSIGNED",
        status: "UNASSIGNED" // <-- "status" currently added by updateWorkOrder resolver (conditionally)
      }
    };

    // Update WO values
    for (const key of MOCK_INPUT_KEYS) {
      updatedWOs[key] = await WorkOrder.updateOne(createdWOs[key], NEW_WO_VALUES[key]);
    }

    // Test updated values
    for (const key of MOCK_INPUT_KEYS) {
      expect(updatedWOs[key]).toMatchObject({
        ...createdWOs[key],
        ...NEW_WO_VALUES[key]
      });
    }

    // TODO Ensure FixitEventEmitter triggered onWorkOrder{Updated,Cancelled,Completed} event handlers
  });

  // DELETE:

  test("WorkOrder.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const { createdByUserID, id } = createdWOs[key];
      const { id: deletedWorkOrderID } = await WorkOrder.deleteItem({ createdByUserID, id });
      // If deleteItem did not error out, the delete succeeded, so delete from createdWOs (for good measure, test returned ID is same as arg)
      expect(deletedWorkOrderID).toEqual(id);
    }
  });
});

// ENSURE MOCK RESOURCE CLEANUP:

afterAll(async () => {
  /* After all tests are complete, ensure all mock Items created here have been deleted.
  Note: DDB methods are called from the ddbClient to circumvent toDB IO hook actions. */

  const remainingMockWOs = await WorkOrder.ddbClient.scan({
    FilterExpression: "begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: { ":skPrefix": "WO#" }
  });

  if (Array.isArray(remainingMockWOs) && remainingMockWOs.length > 0) {
    await WorkOrder.ddbClient.batchDeleteItems(remainingMockWOs.map(({ pk, sk }) => ({ pk, sk })));
  }
});
