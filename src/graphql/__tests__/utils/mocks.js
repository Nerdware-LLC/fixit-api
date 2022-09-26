// import { makeFake } from "@utils";

// This file's named exports are spread directly into apolloServer's configs

export const mockEntireSchema = true; // can set to true for auto-mocks

// TODO update gql mocks

// export const mocks = {
//   Query: () => ({
//     contact: () => makeFake.contact(),
//     contacts: () => makeFake.contacts(),
//     workOrder: () => makeFake.workOrder(),
//     workOrders: () => makeFake.workOrders()
//   }),
//   Contact: () => ({
//     createdBy: () => makeFake.user(),
//     linkedTo: () => makeFake.user()
//   }),
//   User: () => ({
//     profile: () => makeFake.profile()
//   }),
//   WorkOrder: () => ({
//     createdBy: () => makeFake.user(),
//     assignedTo: () => makeFake.contact(),
//     checklist: () => makeFake.checklist()
//   }),
//   DateTime: () => makeFake.dateTimeScalar(),
//   Email: () => makeFake.emailScalar()
// };
