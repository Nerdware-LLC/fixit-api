import moment from "moment";
import { MILLISECONDS_PER_DAY } from "@tests/datetime";
import { WorkOrder } from "./WorkOrder";
import { WORK_ORDER_ID_REGEX, WORK_ORDER_ID_REGEX_STR } from "./regex";
import type { PartialDeep } from "type-fest";
import type { WorkOrderModelItem, WorkOrderModelInput } from "./WorkOrder";

const USER_1 = "USER#11111111-1111-1111-1111-wo1111111111";
const USER_2 = "USER#22222222-2222-2222-2222-wo2222222222";
const USER_3 = "USER#33333333-3333-3333-3333-wo3333333333";

const MOCK_INPUTS: Record<"WO_A" | "WO_B", PartialDeep<WorkOrderModelInput>> = {
  // WO_A contains the bare minimum inputs for WorkOrder.createOne
  WO_A: {
    createdByUserID: USER_1,
    location: {
      region: "Washington",
      city: "Redmond",
      streetLine1: "1 Microsoft Way",
    },
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
      streetLine2: "Attn: #Human Googlers", // <-- tests chars :#
    },
    category: "GENERAL",
    description: "Do cool things at the Googleplex",
    checklist: [
      { description: "Did a cool thing" },
      { description: "Engineer all the things" },
      { description: "Pet a doggo" },
    ],
    dueDate: new Date(Date.now() + MILLISECONDS_PER_DAY * 10), // + 10 days
    entryContact: "Sundar Pichai",
    entryContactPhone: "(555) 123-4567",
    scheduledDateTime: new Date(Date.now() + MILLISECONDS_PER_DAY * 2), // + 2 days
  },
};

type MockInputKey = keyof typeof MOCK_INPUTS;
// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<MockInputKey>;

const testWorkOrderFields = (mockInputsKey: MockInputKey, mockWO: WorkOrderModelItem) => {
  const mockWOinputs = MOCK_INPUTS[mockInputsKey];

  expect(mockWO.createdBy.id).toEqual(mockWOinputs.createdByUserID);
  expect(mockWO.id).toMatch(WORK_ORDER_ID_REGEX);
  expect(mockWO.location).toEqual({ country: "USA", ...mockWOinputs.location });

  expect(moment(mockWO.createdAt).isValid()).toEqual(true);
  expect(moment(mockWO.updatedAt).isValid()).toEqual(true);

  if (mockWOinputs === MOCK_INPUTS.WO_A) {
    expect(mockWO.assignedTo?.id).toEqual("UNASSIGNED");
    expect(mockWO.priority).toEqual("NORMAL");
    //
  } else if (mockWOinputs === MOCK_INPUTS.WO_B) {
    expect(mockWO.assignedTo?.id).toEqual(mockWOinputs.assignedToUserID);
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
          isCompleted: false,
        }),
      ])
    );
  }
};

describe("WorkOrder model R/W database operations", () => {
  const createdWOs = {} as { [K in MockInputKey]: WorkOrderModelItem };

  beforeAll(async () => {
    // Write mock WOs to Table
    for (const key of MOCK_INPUT_KEYS) {
      createdWOs[key] = await WorkOrder.createOne(MOCK_INPUTS[key] as any);
    }
  });

  // CREATE:

  test("WorkOrder.createOne returns expected keys and values", () => {
    Object.entries(createdWOs).forEach(([mockInputsKey, createdWO]) => {
      testWorkOrderFields(mockInputsKey as MockInputKey, createdWO);
    });
  });

  // QUERIES:

  test("WorkOrder.query by WO ID returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const [result] = await WorkOrder.query({
        where: { id: createdWOs[key].id },
        limit: 1,
      });
      testWorkOrderFields(key, result);
    }
  });

  test("WorkOrder.query of User's OWN WorkOrders returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      // Should be an array of 1 WorkOrder
      const workOrders = await WorkOrder.query({
        where: {
          createdByUserID: createdWOs[key].createdBy.id,
          id: { beginsWith: WorkOrder.SK_PREFIX },
        },
      });
      workOrders.forEach((wo) => testWorkOrderFields(key, wo));
    }
  });

  test("WorkOrder.query of User's RECEIVED WorkOrders returns expected keys and values", async () => {
    // Should be an array of 1 WorkOrder (WO_B)
    const workOrders = await WorkOrder.query({
      where: {
        assignedToUserID: MOCK_INPUTS.WO_B.assignedToUserID as string,
        id: { beginsWith: WorkOrder.SK_PREFIX },
      },
    });

    workOrders.forEach((wo) => {
      testWorkOrderFields("WO_B", wo);
    });
  });

  // UPDATE:

  test("WorkOrder.updateOne returns expected keys and values", async () => {
    const updatedWOs = { ...createdWOs };

    const NEW_WO_VALUES: { [K in MockInputKey]: Partial<WorkOrderModelItem> } = {
      WO_A: {
        assignedTo: {
          id: USER_3,
        },
        description: "Visit Google's Toronto HQ",
        location: {
          country: "Canada",
          region: "Ontario",
          city: "Toronto",
          streetLine1: "65 King East",
        },
      },
      WO_B: {
        assignedTo: {
          id: "UNASSIGNED",
        },
        status: "UNASSIGNED", // <-- "status" currently added by updateWorkOrder resolver (conditionally)
      },
    };

    // Update WO values
    for (const key of MOCK_INPUT_KEYS) {
      updatedWOs[key] = await WorkOrder.updateOne(createdWOs[key], NEW_WO_VALUES[key]);
    }

    // Test updated values
    for (const key of MOCK_INPUT_KEYS) {
      expect(updatedWOs[key]).toMatchObject({
        ...createdWOs[key],
        ...NEW_WO_VALUES[key],
      });
    }
  });

  // DELETE:

  test("WorkOrder.deleteItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const {
        createdBy: { id: createdByUserID },
        id: workOrderID,
      } = createdWOs[key];

      const { id: deletedWorkOrderID } = await WorkOrder.deleteItem({
        createdByUserID,
        id: workOrderID,
      });

      // If deleteItem did not error out, the delete succeeded, so delete from createdWOs (for good measure, test returned ID is same as arg)
      expect(deletedWorkOrderID).toMatch(WORK_ORDER_ID_REGEX);
      expect(deletedWorkOrderID).toEqual(workOrderID);
    }
  });
});

// ENSURE MOCK RESOURCE CLEANUP:

afterAll(async () => {
  /* After all tests are complete, ensure all mock Items created here have been deleted.
  Note: DDB methods are called from the ddbClient to circumvent toDB IO hook actions. */

  const remainingMockWOs = await WorkOrder.scan({
    FilterExpression: "begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: { ":skPrefix": WorkOrder.SK_PREFIX },
  });

  if (Array.isArray(remainingMockWOs) && remainingMockWOs.length > 0) {
    await WorkOrder.batchDeleteItems(
      remainingMockWOs.map(({ id, createdBy }) => ({ id, createdByUserID: createdBy.id }))
    );
  }
});
