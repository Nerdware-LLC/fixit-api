import moment from "moment";
import { MILLISECONDS_PER_DAY } from "@tests/datetime";
import { WorkOrder } from "./WorkOrder";
import { WORK_ORDER_ID_REGEX, WORK_ORDER_ID_REGEX_STR } from "./regex";
import type { WorkOrderType } from "./types";

const MOCK_INPUTS = {
  // WO_A contains the bare minimum inputs for WorkOrder.createOne
  WO_A: {
    createdByUserID: "USER#11111111-1111-1111-1111-111111111111",
    location: {
      region: "Washington",
      city: "Redmond",
      streetLine1: "1 Microsoft Way"
    }
  },
  // WO_B contains all WO properties that can be provided to WorkOrder.createOne
  WO_B: {
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
  let createdWOs: Expand<Partial<Record<keyof typeof MOCK_INPUTS, WorkOrderType>>> = {};

  // Write mock Users to Table
  beforeAll(async () => {
    for (const mockInputsKey in MOCK_INPUTS) {
      //
      const createdWO = await WorkOrder.createOne(
        MOCK_INPUTS[mockInputsKey as keyof typeof MOCK_INPUTS]
      );

      createdWOs[mockInputsKey as keyof typeof MOCK_INPUTS] = createdWO;
    }
  });

  test("WorkOrder.createOne returns expected keys and values", () => {
    Object.entries(createdWOs).forEach(([mockInputsKey, createdUser]) => {
      testWorkOrderFields(mockInputsKey as keyof typeof MOCK_INPUTS, createdUser);
    });
  });

  // test("WorkOrder. returns expected keys and values", async () => {
  //   // Get mock Users by email
  //   // for (const mockInputsKey in createdWOs) {
  //   //   const userID = createdWOs[mockInputsKey as keyof typeof MOCK_INPUTS]!.id;
  //   //   const result = await WorkOrder.getUserByID(userID);
  //   //   testWorkOrderFields(mockInputsKey as keyof typeof MOCK_INPUTS, result);
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
  //   // for (const mockInputsKey in MOCK_INPUTS) {
  //   //   const { email } = MOCK_INPUTS[mockInputsKey as keyof typeof MOCK_INPUTS];
  //   //   const result = await User.queryUserByEmail(email);
  //   //   testUserFields(mockInputsKey as keyof typeof MOCK_INPUTS, result);
  //   // }
  // });

  // After tests are complete, delete mock WOs from Table
  afterAll(async () => {
    // batchDeleteItems called from ddbClient to circumvent toDB IO hook actions
    await WorkOrder.ddbClient.batchDeleteItems(
      Object.values(createdWOs as Record<string, { createdByUserID: string; id: string }>).map(
        (wo) => ({
          pk: wo.createdByUserID,
          sk: wo.id
        })
      )
    );
  });
});
