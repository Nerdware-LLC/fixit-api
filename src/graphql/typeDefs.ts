import * as authToken from "./AuthToken/typeDefs.js";
import * as checklist from "./Checklist/typeDefs.js";
import * as contact from "./Contact/typeDefs.js";
import * as fixitUser from "./FixitUser/typeDefs.js";
import * as invite from "./Invite/typeDefs.js";
import * as invoice from "./Invoice/typeDefs.js";
import * as location from "./Location/typeDefs.js";
import * as profile from "./Profile/typeDefs.js";
import * as user from "./User/typeDefs.js";
import * as userStripeConnectAccount from "./UserStripeConnectAccount/typeDefs.js";
import * as userSubscription from "./UserSubscription/typeDefs.js";
import * as workOrder from "./WorkOrder/typeDefs.js";
import * as deleteMutationResponse from "./_common/DeleteMutationResponse/typeDefs.js";
import * as genericSuccessResponse from "./_common/GenericSuccessResponse/typeDefs.js";
import * as dateTimeCustomScalar from "./_customScalars/DateTime/typeDefs.js";
import * as emailCustomScalar from "./_customScalars/Email/typeDefs.js";
import * as root from "./_root/typeDefs.js";

/**
 * Fixit API GQL Schema TypeDefs
 */
export const typeDefs = [
  // EXTENDABLE ROOT TYPES
  root.typeDefs,
  // CUSTOM SCALARS
  dateTimeCustomScalar.typeDefs,
  emailCustomScalar.typeDefs,
  // MUTATION REPONSE TYPES
  deleteMutationResponse.typeDefs,
  genericSuccessResponse.typeDefs,
  // INTERFACES
  fixitUser.typeDefs,
  // CONCRETE TYPES
  checklist.typeDefs,
  contact.typeDefs,
  invoice.typeDefs,
  location.typeDefs,
  profile.typeDefs,
  userStripeConnectAccount.typeDefs,
  user.typeDefs,
  userSubscription.typeDefs,
  workOrder.typeDefs,
  // SIDE-EFFECT MUTATIONS
  invite.typeDefs,
  // OTHER TYPES SHARED WITH CLIENT
  authToken.typeDefs,
];
