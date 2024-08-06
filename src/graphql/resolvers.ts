import * as contact from "./Contact/resolvers.js";
import * as invite from "./Invite/resolvers.js";
import * as invoice from "./Invoice/resolvers.js";
import * as profile from "./Profile/resolvers.js";
import * as publicUserFields from "./PublicUserFields/resolvers.js";
import * as user from "./User/resolvers.js";
import * as userSubscription from "./UserSubscription/resolvers.js";
import * as workOrder from "./WorkOrder/resolvers.js";
import * as dateTimeCustomScalar from "./_scalars/DateTime/resolvers.js";
import * as emailCustomScalar from "./_scalars/Email/resolvers.js";
import type { Resolvers } from "@/types/graphql.js";

/**
 * Fixit API — GraphQL Schema Resolvers
 */
export const resolvers: Array<Resolvers> = [
  // CUSTOM SCALARS
  dateTimeCustomScalar.resolvers,
  emailCustomScalar.resolvers,
  // INTERFACES
  publicUserFields.resolvers,
  // CONCRETE TYPES
  contact.resolvers,
  invoice.resolvers,
  profile.resolvers,
  user.resolvers,
  userSubscription.resolvers,
  workOrder.resolvers,
  // OTHER TYPES
  invite.resolvers,
];
