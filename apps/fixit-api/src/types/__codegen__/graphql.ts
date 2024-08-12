import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { ContactItem } from '@/models/Contact/Contact.js';
import type { PublicUserFieldsCodegenInterface } from '@/graphql/PublicUserFields/types.js';
import type { InvoiceItem } from '@/models/Invoice/Invoice.js';
import type { WorkOrderItem } from '@/models/WorkOrder/WorkOrder.js';
import type { UserSubscriptionItem } from '@/models/UserSubscription/UserSubscription.js';
import type { UserStripeConnectAccountItem } from '@/models/UserStripeConnectAccount/UserStripeConnectAccount.js';
import type { ApolloServerContext } from '@/apolloServer.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Custom DateTime scalar with handling for Date objects and datetime strings */
  DateTime: { input: Date; output: Date; }
  /** Custom Email scalar with regex validation */
  Email: { input: string; output: string; }
};

/** Mutation response for setting a WorkOrder's status to CANCELLED */
export type CancelWorkOrderResponse = DeleteMutationResponse | WorkOrder;

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
};

/**
 * Contact is a type which is simply a concrete implementation of the publicly
 * accessible user fields defined in the PublicUserFields interface. The Contact
 * type represents a user's contact, and is used to manage a user's contacts.
 */
export type Contact = PublicUserFields & {
  __typename?: 'Contact';
  /** (Immutable) Contact creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Contact email address */
  email: Scalars['Email']['output'];
  /** Public-facing handle identifies users to other users (e.g., '@joe') */
  handle: Scalars['String']['output'];
  /** Contact ID internally identifies a user's contact */
  id: Scalars['ID']['output'];
  /** Contact phone number */
  phone?: Maybe<Scalars['String']['output']>;
  /** Contact Profile object */
  profile: Profile;
  /** Timestamp of the most recent Contact object update */
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateChecklistItemInput = {
  description: Scalars['String']['input'];
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateLocationInput = {
  city: Scalars['String']['input'];
  country?: InputMaybe<Scalars['String']['input']>;
  region: Scalars['String']['input'];
  streetLine1: Scalars['String']['input'];
  streetLine2?: InputMaybe<Scalars['String']['input']>;
};

/** Input for creating a new WorkOrder */
export type CreateWorkOrderInput = {
  assignedTo?: InputMaybe<Scalars['ID']['input']>;
  category?: InputMaybe<WorkOrderCategory>;
  checklist?: InputMaybe<Array<CreateChecklistItemInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  entryContact?: InputMaybe<Scalars['String']['input']>;
  entryContactPhone?: InputMaybe<Scalars['String']['input']>;
  location: CreateLocationInput;
  priority?: InputMaybe<WorkOrderPriority>;
  scheduledDateTime?: InputMaybe<Scalars['DateTime']['input']>;
};

/** A mutation response type for delete operations. */
export type DeleteMutationResponse = MutationResponse & {
  __typename?: 'DeleteMutationResponse';
  code?: Maybe<Scalars['String']['output']>;
  /** The ID of the deleted entity. */
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** GraphQLError 'extensions.code' values for client error responses */
export type GraphQlErrorCode =
  /** The GraphQLError 'extensions.code' value for 401-status errors. */
  | 'AUTHENTICATION_REQUIRED'
  /**
   * The GraphQLError 'extensions.code' value for 400-status errors.
   * > This code is an ApolloServer builtin — see [ApolloServerErrorCode][apollo-error-codes].
   * [apollo-error-codes]: https://github.com/apollographql/apollo-server/blob/268687db591fed8293eeded1546ae2f8e6f2b6a7/packages/server/src/errors/index.ts
   */
  | 'BAD_USER_INPUT'
  /** The GraphQLError 'extensions.code' value for 403-status errors. */
  | 'FORBIDDEN'
  /**
   * The GraphQLError 'extensions.code' value for 500-status errors.
   * > This code is an ApolloServer builtin — see [ApolloServerErrorCode][apollo-error-codes].
   * [apollo-error-codes]: https://github.com/apollographql/apollo-server/blob/268687db591fed8293eeded1546ae2f8e6f2b6a7/packages/server/src/errors/index.ts
   */
  | 'INTERNAL_SERVER_ERROR'
  /** The GraphQLError 'extensions.code' value for 402-status errors. */
  | 'PAYMENT_REQUIRED'
  /** The GraphQLError 'extensions.code' value for 404-status errors. */
  | 'RESOURCE_NOT_FOUND';

/**
 * GraphQLError custom extensions for client responses.
 * See https://www.apollographql.com/docs/apollo-server/data/errors/#custom-errors
 */
export type GraphQlErrorCustomExtensions = {
  __typename?: 'GraphQLErrorCustomExtensions';
  code: GraphQlErrorCode;
  http?: Maybe<GraphQlErrorCustomHttpExtension>;
};

/**
 * GraphQLError custom 'http' extension for providing client error responses
 * with traditional HTTP error status codes ('extensions.http.status').
 */
export type GraphQlErrorCustomHttpExtension = {
  __typename?: 'GraphQLErrorCustomHttpExtension';
  /**
   * The HTTP status code for the error:
   * - 400 'Bad User Input'
   * - 401 'Authentication Required'
   * - 402 'Payment Required'
   * - 403 'Forbidden'
   * - 404 'Resource Not Found'
   * - 500 'Internal Server Error'
   */
  status: Scalars['Int']['output'];
};

export type Invoice = {
  __typename?: 'Invoice';
  /** The Invoice amount, represented as an integer which reflects USD centage (i.e., an 'amount' of 1 = $0.01 USD) */
  amount: Scalars['Int']['output'];
  /** (Immutable) The User to whom the Invoice was assigned, AKA the Invoice's recipient */
  assignedTo: User;
  /** (Immutable) Invoice creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** (Immutable) The User who created/sent the Invoice */
  createdBy: User;
  /** (Immutable) Invoice ID, in the format of 'INV#{createdBy.id}#{unixTimestampUUID(createdAt)}' */
  id: Scalars['ID']['output'];
  /** The Invoice status; this field is controlled by the API and can not be directly edited by Users */
  status: InvoiceStatus;
  /** The ID of the most recent successful paymentIntent applied to the Invoice, if any */
  stripePaymentIntentID?: Maybe<Scalars['String']['output']>;
  /** Timestamp of the most recent Invoice update */
  updatedAt: Scalars['DateTime']['output'];
  /** A WorkOrder attached to the Invoice which was created by the 'assignedTo' User */
  workOrder?: Maybe<WorkOrder>;
};

export type InvoiceInput = {
  amount: Scalars['Int']['input'];
  /** The ID of the User to whom the Invoice will be assigned */
  assignedTo: Scalars['ID']['input'];
  workOrderID?: InputMaybe<Scalars['ID']['input']>;
};

export type InvoiceStatus =
  | 'CLOSED'
  | 'DISPUTED'
  | 'OPEN';

export type Location = {
  __typename?: 'Location';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  region: Scalars['String']['output'];
  streetLine1: Scalars['String']['output'];
  streetLine2?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  cancelWorkOrder: CancelWorkOrderResponse;
  createContact: Contact;
  createInvite: MutationResponse;
  createInvoice: Invoice;
  createWorkOrder: WorkOrder;
  deleteContact: DeleteMutationResponse;
  deleteInvoice: DeleteMutationResponse;
  payInvoice: Invoice;
  setWorkOrderStatusComplete: WorkOrder;
  updateInvoiceAmount: Invoice;
  updateProfile: Profile;
  updateWorkOrder: WorkOrder;
};


export type MutationCancelWorkOrderArgs = {
  workOrderID: Scalars['ID']['input'];
};


export type MutationCreateContactArgs = {
  contactUserID: Scalars['ID']['input'];
};


export type MutationCreateInviteArgs = {
  phoneOrEmail: Scalars['String']['input'];
};


export type MutationCreateInvoiceArgs = {
  invoice: InvoiceInput;
};


export type MutationCreateWorkOrderArgs = {
  workOrder: CreateWorkOrderInput;
};


export type MutationDeleteContactArgs = {
  contactID: Scalars['ID']['input'];
};


export type MutationDeleteInvoiceArgs = {
  invoiceID: Scalars['ID']['input'];
};


export type MutationPayInvoiceArgs = {
  invoiceID: Scalars['ID']['input'];
};


export type MutationSetWorkOrderStatusCompleteArgs = {
  workOrderID: Scalars['ID']['input'];
};


export type MutationUpdateInvoiceAmountArgs = {
  amount: Scalars['Int']['input'];
  invoiceID: Scalars['ID']['input'];
};


export type MutationUpdateProfileArgs = {
  profile: ProfileInput;
};


export type MutationUpdateWorkOrderArgs = {
  workOrder: UpdateWorkOrderInput;
  workOrderID: Scalars['ID']['input'];
};

/** A generic mutation response type. */
export type MutationResponse = {
  /**
   * A code for the mutation response. This may be an HTTP status code, like '200',
   * or a GraphQLError code, like 'BAD_USER_INPUT', depending on what makes sense
   * for the implementing type.
   */
  code?: Maybe<Scalars['String']['output']>;
  /** An optional message to provide additional info about the mutation response. */
  message?: Maybe<Scalars['String']['output']>;
  /** Whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

export type MyInvoicesQueryResponse = {
  __typename?: 'MyInvoicesQueryResponse';
  assignedToUser: Array<Invoice>;
  createdByUser: Array<Invoice>;
};

export type MyWorkOrdersQueryResponse = {
  __typename?: 'MyWorkOrdersQueryResponse';
  assignedToUser: Array<WorkOrder>;
  createdByUser: Array<WorkOrder>;
};

export type Profile = {
  __typename?: 'Profile';
  businessName?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  familyName?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
};

export type ProfileInput = {
  businessName?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  familyName?: InputMaybe<Scalars['String']['input']>;
  givenName?: InputMaybe<Scalars['String']['input']>;
  photoUrl?: InputMaybe<Scalars['String']['input']>;
};

/** PublicUserFields is an interface which defines publicly-accessible User fields. */
export type PublicUserFields = {
  createdAt: Scalars['DateTime']['output'];
  /** User email address */
  email: Scalars['Email']['output'];
  /** Public-facing handle identifies users to other users (e.g., '@joe') */
  handle: Scalars['String']['output'];
  /** User or Contact ID */
  id: Scalars['ID']['output'];
  /** User phone number */
  phone?: Maybe<Scalars['String']['output']>;
  /** User Profile object */
  profile: Profile;
  updatedAt: Scalars['DateTime']['output'];
};

export type Query = {
  __typename?: 'Query';
  contact: Contact;
  /**
   * This query returns the public fields of a User whose handle exactly matches the
   * provided `handle` argument. To search for one or more Users whose handle begins
   * with or fuzzy-matches a provided string, use `searchForUsersByHandle`.
   */
  getUserByHandle?: Maybe<User>;
  invoice: Invoice;
  myContacts: Array<Contact>;
  myInvoices: MyInvoicesQueryResponse;
  myProfile: Profile;
  mySubscription: UserSubscription;
  myWorkOrders: MyWorkOrdersQueryResponse;
  profile: Profile;
  /**
   * This query returns a paginated list of Users whose handle begins with the provided
   * `handle` argument, which can be incomplete but must at least contain two characters:
   * the beginning "@", and one character that's either alphanumeric or an underscore.
   *
   * Note that this query is intended to be used in conjunction with a pagination utility
   * like [Apollo's `fetchMore` function](https://www.apollographql.com/docs/react/pagination/core-api#the-fetchmore-function).
   *
   * ### ROADMAP:
   *
   * - Matching Algorithm Change: In the future, the Contact selection method used in this
   *   query will either be replaced by a fuzzy-matching system based on the Levenshtein-Demerau
   *   model, or a cloud-based search service like ElasticSearch. This change will eliminate
   *   the `offset` restrictions in regard to the value of `handle` in follow-up queries.
   * - Response Structure: The response may be converted into an object with keys `data` and
   *   `nextOffset`. The `data` key will contain the array of matching Users, and `nextOffset`
   *   will be the value of the `offset` argument to be used in a follow-up query.
   */
  searchForUsersByHandle: Array<User>;
  workOrder: WorkOrder;
};


export type QueryContactArgs = {
  contactID: Scalars['ID']['input'];
};


export type QueryGetUserByHandleArgs = {
  handle: Scalars['String']['input'];
};


export type QueryInvoiceArgs = {
  invoiceID: Scalars['ID']['input'];
};


export type QueryProfileArgs = {
  profileID: Scalars['ID']['input'];
};


export type QuerySearchForUsersByHandleArgs = {
  handle: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkOrderArgs = {
  workOrderID: Scalars['ID']['input'];
};

/** Names of the currently available Fixit subscription price-models */
export type SubscriptionPriceName =
  /** The annual subscription price model */
  | 'ANNUAL'
  /** The monthly subscription price model */
  | 'MONTHLY'
  /** The trial subscription price model */
  | 'TRIAL';

/**
 * The status of a User's Subscription, as provided by Stripe.
 * See https://docs.stripe.com/api/subscriptions/object#subscription_object-status
 */
export type SubscriptionStatus =
  /** The subscription is active and the user has access to the product */
  | 'active'
  /** The subscription is canceled and the user has lost access to the product */
  | 'canceled'
  /** The subscription is incomplete and has not yet expired */
  | 'incomplete'
  /** The subscription is incomplete and has expired */
  | 'incomplete_expired'
  /** The subscription is past due and the user has lost access to the product */
  | 'past_due'
  /** The subscription is in a limited trial phase and has access to the product */
  | 'trialing'
  /** The subscription is unpaid and the user has lost access to the product */
  | 'unpaid';

export type UpdateChecklistItemInput = {
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateLocationInput = {
  city: Scalars['String']['input'];
  country?: InputMaybe<Scalars['String']['input']>;
  region: Scalars['String']['input'];
  streetLine1: Scalars['String']['input'];
  streetLine2?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating an existing WorkOrder */
export type UpdateWorkOrderInput = {
  assignedToUserID?: InputMaybe<Scalars['ID']['input']>;
  category?: InputMaybe<WorkOrderCategory>;
  checklist?: InputMaybe<Array<UpdateChecklistItemInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  entryContact?: InputMaybe<Scalars['String']['input']>;
  entryContactPhone?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<UpdateLocationInput>;
  priority?: InputMaybe<WorkOrderPriority>;
  scheduledDateTime?: InputMaybe<Scalars['DateTime']['input']>;
};

/** User is an implementation of the PublicUserFields interface which represents an individual User. */
export type User = PublicUserFields & {
  __typename?: 'User';
  /** (Immutable) Account creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** User's own email address */
  email: Scalars['Email']['output'];
  /** (Immutable) Public-facing handle identifies users to other users (e.g., '@joe') */
  handle: Scalars['String']['output'];
  /** (Immutable) User ID internally identifies individual User accounts */
  id: Scalars['ID']['output'];
  /** User's own phone number */
  phone?: Maybe<Scalars['String']['output']>;
  /** User's own Profile object */
  profile: Profile;
  /** Timestamp of the most recent account update */
  updatedAt: Scalars['DateTime']['output'];
};

/** A user's Stripe Connect Account details */
export type UserStripeConnectAccount = {
  __typename?: 'UserStripeConnectAccount';
  /** Whether the user's Stripe Connect Account is enabled for charges */
  chargesEnabled: Scalars['Boolean']['output'];
  /** (Immutable) UserStripeConnectAccount creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Whether the user has submitted all required details to set up their Stripe Connect Account */
  detailsSubmitted: Scalars['Boolean']['output'];
  /** (Immutable) The UserStripeConnectAccount's unique ID */
  id: Scalars['ID']['output'];
  /** Whether the user's Stripe Connect Account is enabled for payouts */
  payoutsEnabled: Scalars['Boolean']['output'];
  /** Timestamp of the most recent UserStripeConnectAccount update */
  updatedAt: Scalars['DateTime']['output'];
};

/** A user's subscription to a Fixit SaaS product */
export type UserSubscription = {
  __typename?: 'UserSubscription';
  /** (Immutable) UserSubscription creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** The timestamp indicating when the current UserSubscription period ends */
  currentPeriodEnd: Scalars['DateTime']['output'];
  /** (Immutable) The UserSubscription's unique ID */
  id: Scalars['ID']['output'];
  /** The UserSubscription's price ID, as provided by Stripe */
  priceID: Scalars['String']['output'];
  /** The UserSubscription's product ID, as provided by Stripe */
  productID: Scalars['String']['output'];
  /** The UserSubscription's status, as provided by Stripe */
  status: SubscriptionStatus;
  /** Timestamp of the most recent UserSubscription update */
  updatedAt: Scalars['DateTime']['output'];
};

/** A WorkOrder is a request one User submits to another for work to be performed at a location */
export type WorkOrder = {
  __typename?: 'WorkOrder';
  /** The User to whom the WorkOrder was assigned, AKA the WorkOrder's recipient */
  assignedTo?: Maybe<User>;
  /** The category of work to be performed as part of the WorkOrder */
  category?: Maybe<WorkOrderCategory>;
  /** The WorkOrder checklist, an array of ChecklistItem objects */
  checklist?: Maybe<Array<Maybe<ChecklistItem>>>;
  /** Notes from the WorkOrder's recipient (this field will be renamed in the future) */
  contractorNotes?: Maybe<Scalars['String']['output']>;
  /** (Immutable) WorkOrder creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** (Immutable) The User who created/sent the WorkOrder */
  createdBy: User;
  /** A general description of the work to be performed as part of the WorkOrder */
  description?: Maybe<Scalars['String']['output']>;
  /** Timestamp of the WorkOrder's due date */
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  /** The name of the WorkOrder's entry contact, if any */
  entryContact?: Maybe<Scalars['String']['output']>;
  /** The phone number of the WorkOrder's entry contact, if any */
  entryContactPhone?: Maybe<Scalars['String']['output']>;
  /** (Immutable) WorkOrder ID, in the format of 'WO#{createdBy.id}#{unixTimestampUUID(createdAt)}' */
  id: Scalars['ID']['output'];
  /** The location of the job site for the WorkOrder */
  location: Location;
  /** The WorkOrder priority */
  priority: WorkOrderPriority;
  /** Timestamp of the WorkOrder's scheduled completion */
  scheduledDateTime?: Maybe<Scalars['DateTime']['output']>;
  /** The WorkOrder status */
  status: WorkOrderStatus;
  /** Timestamp of the most recent WorkOrder update */
  updatedAt: Scalars['DateTime']['output'];
};

/** The category of work to be performed as part of a WorkOrder */
export type WorkOrderCategory =
  /** The WorkOrder involves drywall */
  | 'DRYWALL'
  /** The WorkOrder involves electrical */
  | 'ELECTRICAL'
  /** The WorkOrder involves flooring */
  | 'FLOORING'
  /** The WorkOrder involves general maintenance */
  | 'GENERAL'
  /** The WorkOrder involves HVAC */
  | 'HVAC'
  /** The WorkOrder involves landscaping */
  | 'LANDSCAPING'
  /** The WorkOrder involves masonry */
  | 'MASONRY'
  /** The WorkOrder involves painting */
  | 'PAINTING'
  /** The WorkOrder involves paving */
  | 'PAVING'
  /** The WorkOrder involves pest control */
  | 'PEST'
  /** The WorkOrder involves plumbing */
  | 'PLUMBING'
  /** The WorkOrder involves roofing */
  | 'ROOFING'
  /** The WorkOrder involves trash removal */
  | 'TRASH'
  /** The WorkOrder involves turnover, i.e., general 'make-ready' tasks for a new tenant or owner */
  | 'TURNOVER'
  /** The WorkOrder involves windows */
  | 'WINDOWS';

/** The general priority of a WorkOrder */
export type WorkOrderPriority =
  /** The WorkOrder is of high priority */
  | 'HIGH'
  /** The WorkOrder is of low priority */
  | 'LOW'
  /** The WorkOrder is of normal priority */
  | 'NORMAL';

/** The current status of a WorkOrder */
export type WorkOrderStatus =
  /** The WorkOrder has been assigned to a recipient but has not yet been started */
  | 'ASSIGNED'
  /** The WorkOrder has been cancelled */
  | 'CANCELLED'
  /** The WorkOrder has been completed */
  | 'COMPLETE'
  /** The WorkOrder has been deferred to a later date */
  | 'DEFERRED'
  /** The WorkOrder is in progress */
  | 'IN_PROGRESS'
  /** The WorkOrder has not yet been assigned to a recipient */
  | 'UNASSIGNED';

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  CancelWorkOrderResponse: ( Partial<DeleteMutationResponse> ) | ( WorkOrderItem );
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  MutationResponse: ( Partial<DeleteMutationResponse> );
  PublicUserFields: ( ContactItem ) | ( Partial<User> );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']['output']>>;
  CancelWorkOrderResponse: Partial<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CancelWorkOrderResponse']>>;
  ChecklistItem: ResolverTypeWrapper<Partial<ChecklistItem>>;
  Contact: ResolverTypeWrapper<ContactItem>;
  CreateChecklistItemInput: ResolverTypeWrapper<Partial<CreateChecklistItemInput>>;
  CreateLocationInput: ResolverTypeWrapper<Partial<CreateLocationInput>>;
  CreateWorkOrderInput: ResolverTypeWrapper<Partial<CreateWorkOrderInput>>;
  DateTime: ResolverTypeWrapper<Partial<Scalars['DateTime']['output']>>;
  DeleteMutationResponse: ResolverTypeWrapper<Partial<DeleteMutationResponse>>;
  Email: ResolverTypeWrapper<Partial<Scalars['Email']['output']>>;
  GraphQLErrorCode: ResolverTypeWrapper<Partial<GraphQlErrorCode>>;
  GraphQLErrorCustomExtensions: ResolverTypeWrapper<Partial<GraphQlErrorCustomExtensions>>;
  GraphQLErrorCustomHttpExtension: ResolverTypeWrapper<Partial<GraphQlErrorCustomHttpExtension>>;
  ID: ResolverTypeWrapper<Partial<Scalars['ID']['output']>>;
  Int: ResolverTypeWrapper<Partial<Scalars['Int']['output']>>;
  Invoice: ResolverTypeWrapper<InvoiceItem>;
  InvoiceInput: ResolverTypeWrapper<Partial<InvoiceInput>>;
  InvoiceStatus: ResolverTypeWrapper<Partial<InvoiceStatus>>;
  Location: ResolverTypeWrapper<Partial<Location>>;
  Mutation: ResolverTypeWrapper<{}>;
  MutationResponse: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['MutationResponse']>;
  MyInvoicesQueryResponse: ResolverTypeWrapper<Partial<Omit<MyInvoicesQueryResponse, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversTypes['Invoice']>, createdByUser: Array<ResolversTypes['Invoice']> }>>;
  MyWorkOrdersQueryResponse: ResolverTypeWrapper<Partial<Omit<MyWorkOrdersQueryResponse, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversTypes['WorkOrder']>, createdByUser: Array<ResolversTypes['WorkOrder']> }>>;
  Profile: ResolverTypeWrapper<Partial<Profile>>;
  ProfileInput: ResolverTypeWrapper<Partial<ProfileInput>>;
  PublicUserFields: ResolverTypeWrapper<PublicUserFieldsCodegenInterface>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Partial<Scalars['String']['output']>>;
  SubscriptionPriceName: ResolverTypeWrapper<Partial<SubscriptionPriceName>>;
  SubscriptionStatus: ResolverTypeWrapper<Partial<SubscriptionStatus>>;
  UpdateChecklistItemInput: ResolverTypeWrapper<Partial<UpdateChecklistItemInput>>;
  UpdateLocationInput: ResolverTypeWrapper<Partial<UpdateLocationInput>>;
  UpdateWorkOrderInput: ResolverTypeWrapper<Partial<UpdateWorkOrderInput>>;
  User: ResolverTypeWrapper<Partial<User>>;
  UserStripeConnectAccount: ResolverTypeWrapper<UserStripeConnectAccountItem>;
  UserSubscription: ResolverTypeWrapper<UserSubscriptionItem>;
  WorkOrder: ResolverTypeWrapper<WorkOrderItem>;
  WorkOrderCategory: ResolverTypeWrapper<Partial<WorkOrderCategory>>;
  WorkOrderPriority: ResolverTypeWrapper<Partial<WorkOrderPriority>>;
  WorkOrderStatus: ResolverTypeWrapper<Partial<WorkOrderStatus>>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Partial<Scalars['Boolean']['output']>;
  CancelWorkOrderResponse: Partial<ResolversUnionTypes<ResolversParentTypes>['CancelWorkOrderResponse']>;
  ChecklistItem: Partial<ChecklistItem>;
  Contact: ContactItem;
  CreateChecklistItemInput: Partial<CreateChecklistItemInput>;
  CreateLocationInput: Partial<CreateLocationInput>;
  CreateWorkOrderInput: Partial<CreateWorkOrderInput>;
  DateTime: Partial<Scalars['DateTime']['output']>;
  DeleteMutationResponse: Partial<DeleteMutationResponse>;
  Email: Partial<Scalars['Email']['output']>;
  GraphQLErrorCustomExtensions: Partial<GraphQlErrorCustomExtensions>;
  GraphQLErrorCustomHttpExtension: Partial<GraphQlErrorCustomHttpExtension>;
  ID: Partial<Scalars['ID']['output']>;
  Int: Partial<Scalars['Int']['output']>;
  Invoice: InvoiceItem;
  InvoiceInput: Partial<InvoiceInput>;
  Location: Partial<Location>;
  Mutation: {};
  MutationResponse: ResolversInterfaceTypes<ResolversParentTypes>['MutationResponse'];
  MyInvoicesQueryResponse: Partial<Omit<MyInvoicesQueryResponse, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversParentTypes['Invoice']>, createdByUser: Array<ResolversParentTypes['Invoice']> }>;
  MyWorkOrdersQueryResponse: Partial<Omit<MyWorkOrdersQueryResponse, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversParentTypes['WorkOrder']>, createdByUser: Array<ResolversParentTypes['WorkOrder']> }>;
  Profile: Partial<Profile>;
  ProfileInput: Partial<ProfileInput>;
  PublicUserFields: PublicUserFieldsCodegenInterface;
  Query: {};
  String: Partial<Scalars['String']['output']>;
  UpdateChecklistItemInput: Partial<UpdateChecklistItemInput>;
  UpdateLocationInput: Partial<UpdateLocationInput>;
  UpdateWorkOrderInput: Partial<UpdateWorkOrderInput>;
  User: Partial<User>;
  UserStripeConnectAccount: UserStripeConnectAccountItem;
  UserSubscription: UserSubscriptionItem;
  WorkOrder: WorkOrderItem;
}>;

export type CancelWorkOrderResponseResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['CancelWorkOrderResponse'] = ResolversParentTypes['CancelWorkOrderResponse']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeleteMutationResponse' | 'WorkOrder', ParentType, ContextType>;
}>;

export type ChecklistItemResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['ChecklistItem'] = ResolversParentTypes['ChecklistItem']> = ResolversObject<{
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['Contact'] = ResolversParentTypes['Contact']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteMutationResponseResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['DeleteMutationResponse'] = ResolversParentTypes['DeleteMutationResponse']> = ResolversObject<{
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface EmailScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Email'], any> {
  name: 'Email';
}

export type GraphQlErrorCustomExtensionsResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['GraphQLErrorCustomExtensions'] = ResolversParentTypes['GraphQLErrorCustomExtensions']> = ResolversObject<{
  code?: Resolver<ResolversTypes['GraphQLErrorCode'], ParentType, ContextType>;
  http?: Resolver<Maybe<ResolversTypes['GraphQLErrorCustomHttpExtension']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GraphQlErrorCustomHttpExtensionResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['GraphQLErrorCustomHttpExtension'] = ResolversParentTypes['GraphQLErrorCustomHttpExtension']> = ResolversObject<{
  status?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvoiceResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  assignedTo?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InvoiceStatus'], ParentType, ContextType>;
  stripePaymentIntentID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  workOrder?: Resolver<Maybe<ResolversTypes['WorkOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LocationResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = ResolversObject<{
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  streetLine1?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  streetLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  cancelWorkOrder?: Resolver<ResolversTypes['CancelWorkOrderResponse'], ParentType, ContextType, RequireFields<MutationCancelWorkOrderArgs, 'workOrderID'>>;
  createContact?: Resolver<ResolversTypes['Contact'], ParentType, ContextType, RequireFields<MutationCreateContactArgs, 'contactUserID'>>;
  createInvite?: Resolver<ResolversTypes['MutationResponse'], ParentType, ContextType, RequireFields<MutationCreateInviteArgs, 'phoneOrEmail'>>;
  createInvoice?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType, RequireFields<MutationCreateInvoiceArgs, 'invoice'>>;
  createWorkOrder?: Resolver<ResolversTypes['WorkOrder'], ParentType, ContextType, RequireFields<MutationCreateWorkOrderArgs, 'workOrder'>>;
  deleteContact?: Resolver<ResolversTypes['DeleteMutationResponse'], ParentType, ContextType, RequireFields<MutationDeleteContactArgs, 'contactID'>>;
  deleteInvoice?: Resolver<ResolversTypes['DeleteMutationResponse'], ParentType, ContextType, RequireFields<MutationDeleteInvoiceArgs, 'invoiceID'>>;
  payInvoice?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType, RequireFields<MutationPayInvoiceArgs, 'invoiceID'>>;
  setWorkOrderStatusComplete?: Resolver<ResolversTypes['WorkOrder'], ParentType, ContextType, RequireFields<MutationSetWorkOrderStatusCompleteArgs, 'workOrderID'>>;
  updateInvoiceAmount?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType, RequireFields<MutationUpdateInvoiceAmountArgs, 'amount' | 'invoiceID'>>;
  updateProfile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'profile'>>;
  updateWorkOrder?: Resolver<ResolversTypes['WorkOrder'], ParentType, ContextType, RequireFields<MutationUpdateWorkOrderArgs, 'workOrder' | 'workOrderID'>>;
}>;

export type MutationResponseResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['MutationResponse'] = ResolversParentTypes['MutationResponse']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeleteMutationResponse', ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type MyInvoicesQueryResponseResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['MyInvoicesQueryResponse'] = ResolversParentTypes['MyInvoicesQueryResponse']> = ResolversObject<{
  assignedToUser?: Resolver<Array<ResolversTypes['Invoice']>, ParentType, ContextType>;
  createdByUser?: Resolver<Array<ResolversTypes['Invoice']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MyWorkOrdersQueryResponseResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['MyWorkOrdersQueryResponse'] = ResolversParentTypes['MyWorkOrdersQueryResponse']> = ResolversObject<{
  assignedToUser?: Resolver<Array<ResolversTypes['WorkOrder']>, ParentType, ContextType>;
  createdByUser?: Resolver<Array<ResolversTypes['WorkOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfileResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = ResolversObject<{
  businessName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  familyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  photoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PublicUserFieldsResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['PublicUserFields'] = ResolversParentTypes['PublicUserFields']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Contact' | 'User', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  contact?: Resolver<ResolversTypes['Contact'], ParentType, ContextType, RequireFields<QueryContactArgs, 'contactID'>>;
  getUserByHandle?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByHandleArgs, 'handle'>>;
  invoice?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType, RequireFields<QueryInvoiceArgs, 'invoiceID'>>;
  myContacts?: Resolver<Array<ResolversTypes['Contact']>, ParentType, ContextType>;
  myInvoices?: Resolver<ResolversTypes['MyInvoicesQueryResponse'], ParentType, ContextType>;
  myProfile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  mySubscription?: Resolver<ResolversTypes['UserSubscription'], ParentType, ContextType>;
  myWorkOrders?: Resolver<ResolversTypes['MyWorkOrdersQueryResponse'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType, RequireFields<QueryProfileArgs, 'profileID'>>;
  searchForUsersByHandle?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QuerySearchForUsersByHandleArgs, 'handle' | 'limit' | 'offset'>>;
  workOrder?: Resolver<ResolversTypes['WorkOrder'], ParentType, ContextType, RequireFields<QueryWorkOrderArgs, 'workOrderID'>>;
}>;

export type UserResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserStripeConnectAccountResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['UserStripeConnectAccount'] = ResolversParentTypes['UserStripeConnectAccount']> = ResolversObject<{
  chargesEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  detailsSubmitted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payoutsEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSubscriptionResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['UserSubscription'] = ResolversParentTypes['UserSubscription']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentPeriodEnd?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priceID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkOrderResolvers<ContextType = ApolloServerContext, ParentType extends ResolversParentTypes['WorkOrder'] = ResolversParentTypes['WorkOrder']> = ResolversObject<{
  assignedTo?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['WorkOrderCategory']>, ParentType, ContextType>;
  checklist?: Resolver<Maybe<Array<Maybe<ResolversTypes['ChecklistItem']>>>, ParentType, ContextType>;
  contractorNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  entryContact?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entryContactPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['Location'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['WorkOrderPriority'], ParentType, ContextType>;
  scheduledDateTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['WorkOrderStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ApolloServerContext> = ResolversObject<{
  CancelWorkOrderResponse?: CancelWorkOrderResponseResolvers<ContextType>;
  ChecklistItem?: ChecklistItemResolvers<ContextType>;
  Contact?: ContactResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteMutationResponse?: DeleteMutationResponseResolvers<ContextType>;
  Email?: GraphQLScalarType;
  GraphQLErrorCustomExtensions?: GraphQlErrorCustomExtensionsResolvers<ContextType>;
  GraphQLErrorCustomHttpExtension?: GraphQlErrorCustomHttpExtensionResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  Location?: LocationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MutationResponse?: MutationResponseResolvers<ContextType>;
  MyInvoicesQueryResponse?: MyInvoicesQueryResponseResolvers<ContextType>;
  MyWorkOrdersQueryResponse?: MyWorkOrdersQueryResponseResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  PublicUserFields?: PublicUserFieldsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserStripeConnectAccount?: UserStripeConnectAccountResolvers<ContextType>;
  UserSubscription?: UserSubscriptionResolvers<ContextType>;
  WorkOrder?: WorkOrderResolvers<ContextType>;
}>;

