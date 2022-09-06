import { makeFake } from "@utils";

// TODO update mocks

export const mocks = {
  Query: () => ({
    contact: () => makeFake.contact(),
    contacts: () => makeFake.contacts(),
    workOrder: () => makeFake.workOrder(),
    workOrders: () => makeFake.workOrders()
  }),
  Contact: () => ({
    // FIXME Update Contact mocks
    createdBy: () => makeFake.user(),
    linkedTo: () => makeFake.user()
  }),
  User: () => ({
    profile: () => makeFake.profile()
  }),
  WorkOrder: () => ({
    createdBy: () => makeFake.user(),
    assignedTo: () => makeFake.contact(),
    checklist: () => makeFake.checklist()
  }),
  DateTime: () => makeFake.dateTimeScalar(),
  Email: () => makeFake.emailScalar()
};
