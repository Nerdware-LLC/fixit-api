import { jest } from "@jest/globals";
import moment from "moment";
import { ddbSingleTable } from "@lib/dynamoDB";
import { WorkOrder } from "./WorkOrder";
import { WORK_ORDER_ID_REGEX, WORK_ORDER_ID_REGEX_STR } from "./regex";
import type { WorkOrderType } from "./types";

// Requires "maxWorkers" to be 1
await ddbSingleTable.ensureTableIsActive();

const SECONDS_PER_DAY = 86400;
const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;

const MOCK_WO_INPUTS = {
  WO_A: {
    // Bare minimum inputs for WorkOrder.createOne
    createdByUserID: "USER#11111111-1111-1111-1111-111111111111",
    location: {
      region: "Washington",
      city: "Redmond",
      streetLine1: "1 Microsoft Way"
    }
  },
  WO_B: {
    // All WO properties that can be provided to WorkOrder.createOne
    createdByUserID: "USER#22222222-2222-2222-2222-222222222222",
    assignedToUserID: "USER#11111111-1111-1111-1111-111111111111",
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

jest.setTimeout(15000); // 15s

const testWorkOrderFields = (
  mockWorkOrderKey: keyof typeof MOCK_WO_INPUTS,
  woInstanceObj: WorkOrderType
) => {
  const mockWO = MOCK_WO_INPUTS[mockWorkOrderKey];

  expect(woInstanceObj.createdByUserID).toEqual(mockWO.createdByUserID);
  expect(woInstanceObj.id).toMatch(WORK_ORDER_ID_REGEX);
  expect(woInstanceObj.location).toEqual({ country: "USA", ...mockWO.location });

  expect(moment(woInstanceObj.createdAt).isValid()).toEqual(true);
  expect(moment(woInstanceObj.updatedAt).isValid()).toEqual(true);

  if (mockWO === MOCK_WO_INPUTS.WO_A) {
    expect(woInstanceObj.assignedToUserID).toEqual("UNASSIGNED");
    expect(woInstanceObj.priority).toEqual("NORMAL");
    //
  } else if (mockWO === MOCK_WO_INPUTS.WO_B) {
    expect(woInstanceObj.assignedToUserID).toEqual(mockWO.assignedToUserID);
    expect(woInstanceObj.description).toEqual(mockWO.description);
    expect(woInstanceObj.priority).toEqual(mockWO.priority);
    expect(woInstanceObj.category).toEqual(mockWO.category);
    expect(woInstanceObj.entryContact).toEqual(mockWO.entryContact);
    expect(woInstanceObj.entryContactPhone).toEqual(mockWO.entryContactPhone);
    expect(moment(woInstanceObj.dueDate).isValid()).toEqual(true);
    expect(moment(woInstanceObj.scheduledDateTime).isValid()).toEqual(true);
    expect(woInstanceObj.checklist).toEqual(
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
  let createdWOs: Partial<Record<keyof typeof MOCK_WO_INPUTS, WorkOrderType>> = {};

  // Write mock Users to Table
  beforeAll(async () => {
    for (const mockWorkOrderKey in MOCK_WO_INPUTS) {
      //
      const createdWO = await WorkOrder.createOne(
        MOCK_WO_INPUTS[mockWorkOrderKey as keyof typeof MOCK_WO_INPUTS]
      );

      createdWOs[mockWorkOrderKey as keyof typeof MOCK_WO_INPUTS] = createdWO;
    }
  });

  test("WorkOrder.createOne returns expected keys and values", () => {
    Object.entries(createdWOs).forEach(([mockWorkOrderKey, createdUser]) => {
      testWorkOrderFields(mockWorkOrderKey as keyof typeof MOCK_WO_INPUTS, createdUser);
    });
  });

  // test("WorkOrder. returns expected keys and values", async () => {
  //   // Get mock Users by email
  //   // for (const mockWorkOrderKey in createdWOs) {
  //   //   const userID = createdWOs[mockWorkOrderKey as keyof typeof MOCK_WO_INPUTS]!.id;
  //   //   const result = await WorkOrder.getUserByID(userID);
  //   //   testWorkOrderFields(mockWorkOrderKey as keyof typeof MOCK_WO_INPUTS, result);
  //   // }
  // });

  // test("WorkOrder. returns expected keys and values", async () => {
  //   // const users = await WorkOrder.batchGetUsersByID([createdWOs!.WO_A!.id, createdWOs!.WO_B!.id]);
  //   // users.forEach((user) => {
  //   //   testWorkOrderFields(user.id === createdWOs!.USER_A!.id ? "USER_A" : "USER_B", user);
  //   // });
  // });

  // test("User. returns expected keys and values", async () => {
  //   // Get mock Users by email
  //   // for (const mockWorkOrderKey in MOCK_WO_INPUTS) {
  //   //   const { email } = MOCK_WO_INPUTS[mockWorkOrderKey as keyof typeof MOCK_WO_INPUTS];
  //   //   const result = await User.queryUserByEmail(email);
  //   //   testUserFields(mockWorkOrderKey as keyof typeof MOCK_WO_INPUTS, result);
  //   // }
  // });
});
