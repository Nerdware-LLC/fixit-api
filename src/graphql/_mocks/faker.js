import faker from "faker/locale/en_US";
import { WorkOrderEnums } from "@models/WorkOrder";

// https://www.npmjs.com/package/faker

const makeFakeEnum = (enumArray) =>
  enumArray[faker.random.number({ min: 0, max: enumArray.length - 1 })];
const BOOLS = [0, 1];
const makeFakeBool = () => !!BOOLS[faker.random.number({ min: 0, max: 1 })];

// FIXME update ID mocks

const makeFakeUser = () => ({
  __typename: "User",
  id: faker.random.number(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  profile: makeFakeProfile(),
  stripeCustomerID: faker.random.number(),
  createdAt: faker.date.recent()
});

const makeFakeProfile = () => ({
  __typename: "Profile",
  id: faker.random.number(),
  givenName: faker.name.firstName(),
  familyName: faker.name.lastName(),
  businessName: faker.company.companyName(),
  photoUrl: faker.image.imageUrl()
});

const makeFakeContact = () => ({
  __typename: "Contact",
  id: faker.random.number()
  // FIXME
});

const makeFakeWO = () => ({
  __typename: "WorkOrder",
  id: faker.random.number(),
  createdBy: makeFakeUser(),
  assignedTo: makeFakeContact(),
  status: makeFakeEnum(WorkOrderEnums.STATUSES),
  priority: makeFakeEnum(WorkOrderEnums.PRIORITIES),
  address: faker.address.streetAddress(),
  category: makeFakeEnum(WorkOrderEnums.CATEGORIES),
  description: faker.lorem.sentence(),
  checklist: makeDataFakes(makeFakeChecklistItem, 3),
  dueDate: faker.date.future(),
  scheduledDateTime: faker.date.future(),
  createdAt: faker.date.recent()
});

const makeFakeChecklistItem = () => ({
  __typename: "ChecklistItem",
  id: faker.random.number(),
  description: faker.lorem.words(faker.random.number({ min: 3, max: 6 })),
  isCompleted: makeFakeBool()
});

const makeDataFakes = (fakeMakerFunc, count = 10) => {
  let i;
  const fakes = [];
  for (i = 0; i < count; i++) {
    fakes.push(fakeMakerFunc());
  }
  return fakes;
};

export const makeFake = {
  dateTimeScalar: () => faker.date.recent(),
  emailScalar: () => faker.internet.email(),
  user: () => makeFakeUser(),
  users: (count = 10) => makeDataFakes(makeFakeUser, count),
  profile: () => makeFakeProfile(),
  profiles: (count = 10) => makeDataFakes(makeFakeProfile, count),
  contact: () => makeFakeContact(),
  contacts: (count = 15) => makeDataFakes(makeFakeContact, count),
  workOrder: () => makeFakeWO(),
  workOrders: (count = 20) => makeDataFakes(makeFakeWO, count),
  checklist: () => makeDataFakes(makeFakeChecklistItem, 3)
};
