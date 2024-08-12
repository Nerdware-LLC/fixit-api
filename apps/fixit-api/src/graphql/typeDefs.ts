import * as checklist from "./Checklist/typeDefs.js";
import * as contact from "./Contact/typeDefs.js";
import * as graphQLErrorExtensions from "./GraphQLError/typeDefs.js";
import * as invite from "./Invite/typeDefs.js";
import * as invoice from "./Invoice/typeDefs.js";
import * as location from "./Location/typeDefs.js";
import * as profile from "./Profile/typeDefs.js";
import * as publicUserFields from "./PublicUserFields/typeDefs.js";
import * as user from "./User/typeDefs.js";
import * as userStripeConnectAccount from "./UserStripeConnectAccount/typeDefs.js";
import * as userSubscription from "./UserSubscription/typeDefs.js";
import * as workOrder from "./WorkOrder/typeDefs.js";
import * as deleteMutationResponse from "./_responses/DeleteMutationResponse/typeDefs.js";
import * as mutationResponse from "./_responses/MutationResponse/typeDefs.js";
import * as root from "./_root/typeDefs.js";
import * as dateTimeCustomScalar from "./_scalars/DateTime/typeDefs.js";
import * as emailCustomScalar from "./_scalars/Email/typeDefs.js";

/**
 * Fixit API — GraphQL Schema TypeDefs
 */
export const typeDefs: Array<string> = [
  // ROOT TYPES
  root.typeDefs,
  // CUSTOM SCALARS
  dateTimeCustomScalar.typeDefs,
  emailCustomScalar.typeDefs,
  // GQL ERROR EXTENSION TYPES
  graphQLErrorExtensions.typeDefs,
  // MUTATION REPONSE TYPES
  mutationResponse.typeDefs,
  deleteMutationResponse.typeDefs,
  // INTERFACES
  publicUserFields.typeDefs,
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
  // OTHER TYPES
  invite.typeDefs,
];
