import * as authToken from "./AuthToken/typeDefs";
import * as checklist from "./Checklist/typeDefs";
import * as contact from "./Contact/typeDefs";
import * as fixitUser from "./FixitUser/typeDefs";
import * as invite from "./Invite/typeDefs";
import * as invoice from "./Invoice/typeDefs";
import * as location from "./Location/typeDefs";
import * as profile from "./Profile/typeDefs";
import * as user from "./User/typeDefs";
import * as userStripeConnectAccount from "./UserStripeConnectAccount/typeDefs";
import * as userSubscription from "./UserSubscription/typeDefs";
import * as workOrder from "./WorkOrder/typeDefs";
import * as deleteMutationResponse from "./_common/DeleteMutationResponse/typeDefs";
import * as genericSuccessResponse from "./_common/GenericSuccessResponse/typeDefs";
import * as dateTimeCustomScalar from "./_customScalars/DateTime/typeDefs";
import * as emailCustomScalar from "./_customScalars/Email/typeDefs";
import * as root from "./_root/typeDefs";

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
