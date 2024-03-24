import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { UserItem } from '@/models/User/User.js';
import type { ContactItem } from '@/models/Contact/Contact.js';
import type { FixitUserCodegenInterface } from '@/graphql/FixitUser/types.js';
import type { InvoiceItem } from '@/models/Invoice/Invoice.js';
import type { WorkOrderItem } from '@/models/WorkOrder/WorkOrder.js';
import type { UserSubscriptionItem } from '@/models/UserSubscription/UserSubscription.js';
import type { UserStripeConnectAccountItem } from '@/models/UserStripeConnectAccount/UserStripeConnectAccount.js';
import type { ApolloServerResolverContext } from '@/apolloServer.js';
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

export type AuthTokenPayload = {
  __typename?: 'AuthTokenPayload';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  phone: Scalars['String']['output'];
  profile: Profile;
  stripeConnectAccount: AuthTokenPayloadStripeConnectAccountInfo;
  stripeCustomerID: Scalars['String']['output'];
  subscription?: Maybe<AuthTokenPayloadSubscriptionInfo>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AuthTokenPayloadStripeConnectAccountInfo = {
  __typename?: 'AuthTokenPayloadStripeConnectAccountInfo';
  chargesEnabled: Scalars['Boolean']['output'];
  detailsSubmitted: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  payoutsEnabled: Scalars['Boolean']['output'];
};

export type AuthTokenPayloadSubscriptionInfo = {
  __typename?: 'AuthTokenPayloadSubscriptionInfo';
  currentPeriodEnd: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  status: SubscriptionStatus;
};

export type CancelWorkOrderResponse = DeleteMutationResponse | WorkOrder;

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
};

/**
 * Contact is a type which is simply a concrete implementation of the publicly
 * accessible User fields defined in the FixitUser interface. The Contact type is
 * meant to ensure that private User fields are not available to anyone other than
 * the User who owns the data.
 */
export type Contact = FixitUser & {
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

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse';
  id: Scalars['ID']['output'];
  wasDeleted: Scalars['Boolean']['output'];
};

/**
 * FixitUser is an interface which defines publicly-accessible User fields. This
 * interface has two concrete implementations: Contact, which is simply a concrete
 * implementation of the same publicly-available fields, and User, which adds private
 * fields which are not accessible to other users.
 */
export type FixitUser = {
  createdAt: Scalars['DateTime']['output'];
  /** Email address of either a User or Contact */
  email: Scalars['Email']['output'];
  /** Public-facing handle identifies users to other users (e.g., '@joe') */
  handle: Scalars['String']['output'];
  /** User ID internally identifies individual User accounts */
  id: Scalars['ID']['output'];
  /** Phone number of either a User or Contact */
  phone?: Maybe<Scalars['String']['output']>;
  /** Profile object of either a User or Contact */
  profile: Profile;
  updatedAt: Scalars['DateTime']['output'];
};

/**
 * Generic response-type for mutations which simply returns a "wasSuccessful" boolean.
 * This is only ever used as a "last-resort" response-type for mutations which meet all
 * of the following criteria:
 *   1. The mutation does not perform any database CRUD operations.
 *   2. The mutation does not perform any CRUD operations on data maintained by the client-side cache.
 *   3. No other response-type is appropriate for the mutation.
 *
 * Typically the only mutations for which this reponse-type is appropriate are those which
 * perform some sort of "side-effect" (e.g. sending an email, sending a text message, etc.).
 */
export type GenericSuccessResponse = {
  __typename?: 'GenericSuccessResponse';
  wasSuccessful: Scalars['Boolean']['output'];
};

export type Invoice = {
  __typename?: 'Invoice';
  /** The Invoice amount, represented as an integer which reflects USD centage (i.e., an 'amount' of 1 = $0.01 USD) */
  amount: Scalars['Int']['output'];
  /** (Immutable) The FixitUser to whom the Invoice was assigned, AKA the Invoice's recipient */
  assignedTo: FixitUser;
  /** (Immutable) Invoice creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** (Immutable) The FixitUser who created/sent the Invoice */
  createdBy: FixitUser;
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
  _root?: Maybe<Scalars['Boolean']['output']>;
  cancelWorkOrder: CancelWorkOrderResponse;
  createContact: Contact;
  createInvite: GenericSuccessResponse;
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

export type MyInvoicesQueryReturnType = {
  __typename?: 'MyInvoicesQueryReturnType';
  assignedToUser: Array<Invoice>;
  createdByUser: Array<Invoice>;
};

export type MyWorkOrdersQueryReturnType = {
  __typename?: 'MyWorkOrdersQueryReturnType';
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

export type Query = {
  __typename?: 'Query';
  _root?: Maybe<Scalars['Boolean']['output']>;
  contact: Contact;
  /**
   * This query returns the public fields of a User whose handle exactly matches the
   * provided `handle` argument. To search for one or more Users whose handle begins
   * with or fuzzy-matches a provided string, use `searchForUsersByHandle`.
   */
  getUserByHandle?: Maybe<Contact>;
  invoice: Invoice;
  myContacts: Array<Contact>;
  myInvoices: MyInvoicesQueryReturnType;
  myProfile: Profile;
  mySubscription: UserSubscription;
  myWorkOrders: MyWorkOrdersQueryReturnType;
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
  searchForUsersByHandle: Array<Contact>;
  user: User;
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

export type SubscriptionPriceLabel =
  | 'ANNUAL'
  | 'MONTHLY'
  | 'TRIAL';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
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

/**
 * User is an implementation of the FixitUser interface which includes both the
 * publicly-accessible FixitUser/Contact fields as well as private fields which
 * are only accessible by the User who owns the data.
 */
export type User = FixitUser & {
  __typename?: 'User';
  /** (Immutable) Account creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** (Immutable) User's own email address */
  email: Scalars['Email']['output'];
  /** (Mobile-Only) User's Expo push token, used to send push notifications to the User's mobile device */
  expoPushToken?: Maybe<Scalars['String']['output']>;
  /** (Immutable) Public-facing handle identifies users to other users (e.g., '@joe') */
  handle: Scalars['String']['output'];
  /** (Immutable) User ID internally identifies individual User accounts */
  id: Scalars['ID']['output'];
  /** User's own phone number */
  phone?: Maybe<Scalars['String']['output']>;
  /** User's own Profile object */
  profile: Profile;
  /** User Stripe Connect Account info */
  stripeConnectAccount?: Maybe<UserStripeConnectAccount>;
  /** User's Stripe Customer ID (defined and generated by Stripe) */
  stripeCustomerID: Scalars['String']['output'];
  /** User Subscription info */
  subscription?: Maybe<UserSubscription>;
  /** Timestamp of the most recent account update */
  updatedAt: Scalars['DateTime']['output'];
};

export type UserStripeConnectAccount = {
  __typename?: 'UserStripeConnectAccount';
  chargesEnabled: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  detailsSubmitted: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  payoutsEnabled: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UserSubscription = {
  __typename?: 'UserSubscription';
  createdAt: Scalars['DateTime']['output'];
  currentPeriodEnd: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  priceID: Scalars['String']['output'];
  productID: Scalars['String']['output'];
  status: SubscriptionStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** A WorkOrder is a request one User submits to another for work to be performed at a location */
export type WorkOrder = {
  __typename?: 'WorkOrder';
  /** The FixitUser to whom the WorkOrder was assigned, AKA the WorkOrder's recipient */
  assignedTo?: Maybe<FixitUser>;
  /** The category of work to be performed as part of the WorkOrder */
  category?: Maybe<WorkOrderCategory>;
  /** The WorkOrder checklist, an array of ChecklistItem objects */
  checklist?: Maybe<Array<Maybe<ChecklistItem>>>;
  /** Notes from the WorkOrder's recipient (this field will be renamed in the future) */
  contractorNotes?: Maybe<Scalars['String']['output']>;
  /** (Immutable) WorkOrder creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** (Immutable) The FixitUser who created/sent the WorkOrder */
  createdBy: FixitUser;
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

export type WorkOrderCategory =
  | 'DRYWALL'
  | 'ELECTRICAL'
  | 'FLOORING'
  | 'GENERAL'
  | 'HVAC'
  | 'LANDSCAPING'
  | 'MASONRY'
  | 'PAINTING'
  | 'PAVING'
  | 'PEST'
  | 'PLUMBING'
  | 'ROOFING'
  | 'TRASH'
  | 'TURNOVER'
  | 'WINDOWS';

export type WorkOrderPriority =
  | 'HIGH'
  | 'LOW'
  | 'NORMAL';

export type WorkOrderStatus =
  | 'ASSIGNED'
  | 'CANCELLED'
  | 'COMPLETE'
  | 'DEFERRED'
  | 'IN_PROGRESS'
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
  CancelWorkOrderResponse: ( DeleteMutationResponse ) | ( WorkOrderItem );
}>;


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AuthTokenPayload: ResolverTypeWrapper<AuthTokenPayload>;
  AuthTokenPayloadStripeConnectAccountInfo: ResolverTypeWrapper<AuthTokenPayloadStripeConnectAccountInfo>;
  AuthTokenPayloadSubscriptionInfo: ResolverTypeWrapper<AuthTokenPayloadSubscriptionInfo>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CancelWorkOrderResponse: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CancelWorkOrderResponse']>;
  ChecklistItem: ResolverTypeWrapper<ChecklistItem>;
  Contact: ResolverTypeWrapper<ContactItem>;
  CreateChecklistItemInput: CreateChecklistItemInput;
  CreateLocationInput: CreateLocationInput;
  CreateWorkOrderInput: CreateWorkOrderInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteMutationResponse: ResolverTypeWrapper<DeleteMutationResponse>;
  Email: ResolverTypeWrapper<Scalars['Email']['output']>;
  FixitUser: ResolverTypeWrapper<FixitUserCodegenInterface>;
  GenericSuccessResponse: ResolverTypeWrapper<GenericSuccessResponse>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Invoice: ResolverTypeWrapper<InvoiceItem>;
  InvoiceInput: InvoiceInput;
  InvoiceStatus: InvoiceStatus;
  Location: ResolverTypeWrapper<Location>;
  Mutation: ResolverTypeWrapper<{}>;
  MyInvoicesQueryReturnType: ResolverTypeWrapper<Omit<MyInvoicesQueryReturnType, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversTypes['Invoice']>, createdByUser: Array<ResolversTypes['Invoice']> }>;
  MyWorkOrdersQueryReturnType: ResolverTypeWrapper<Omit<MyWorkOrdersQueryReturnType, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversTypes['WorkOrder']>, createdByUser: Array<ResolversTypes['WorkOrder']> }>;
  Profile: ResolverTypeWrapper<Profile>;
  ProfileInput: ProfileInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubscriptionPriceLabel: SubscriptionPriceLabel;
  SubscriptionStatus: SubscriptionStatus;
  UpdateChecklistItemInput: UpdateChecklistItemInput;
  UpdateLocationInput: UpdateLocationInput;
  UpdateWorkOrderInput: UpdateWorkOrderInput;
  User: ResolverTypeWrapper<UserItem>;
  UserStripeConnectAccount: ResolverTypeWrapper<UserStripeConnectAccountItem>;
  UserSubscription: ResolverTypeWrapper<UserSubscriptionItem>;
  WorkOrder: ResolverTypeWrapper<WorkOrderItem>;
  WorkOrderCategory: WorkOrderCategory;
  WorkOrderPriority: WorkOrderPriority;
  WorkOrderStatus: WorkOrderStatus;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AuthTokenPayload: AuthTokenPayload;
  AuthTokenPayloadStripeConnectAccountInfo: AuthTokenPayloadStripeConnectAccountInfo;
  AuthTokenPayloadSubscriptionInfo: AuthTokenPayloadSubscriptionInfo;
  Boolean: Scalars['Boolean']['output'];
  CancelWorkOrderResponse: ResolversUnionTypes<ResolversParentTypes>['CancelWorkOrderResponse'];
  ChecklistItem: ChecklistItem;
  Contact: ContactItem;
  CreateChecklistItemInput: CreateChecklistItemInput;
  CreateLocationInput: CreateLocationInput;
  CreateWorkOrderInput: CreateWorkOrderInput;
  DateTime: Scalars['DateTime']['output'];
  DeleteMutationResponse: DeleteMutationResponse;
  Email: Scalars['Email']['output'];
  FixitUser: FixitUserCodegenInterface;
  GenericSuccessResponse: GenericSuccessResponse;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Invoice: InvoiceItem;
  InvoiceInput: InvoiceInput;
  Location: Location;
  Mutation: {};
  MyInvoicesQueryReturnType: Omit<MyInvoicesQueryReturnType, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversParentTypes['Invoice']>, createdByUser: Array<ResolversParentTypes['Invoice']> };
  MyWorkOrdersQueryReturnType: Omit<MyWorkOrdersQueryReturnType, 'assignedToUser' | 'createdByUser'> & { assignedToUser: Array<ResolversParentTypes['WorkOrder']>, createdByUser: Array<ResolversParentTypes['WorkOrder']> };
  Profile: Profile;
  ProfileInput: ProfileInput;
  Query: {};
  String: Scalars['String']['output'];
  UpdateChecklistItemInput: UpdateChecklistItemInput;
  UpdateLocationInput: UpdateLocationInput;
  UpdateWorkOrderInput: UpdateWorkOrderInput;
  User: UserItem;
  UserStripeConnectAccount: UserStripeConnectAccountItem;
  UserSubscription: UserSubscriptionItem;
  WorkOrder: WorkOrderItem;
}>;

export type AuthTokenPayloadResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['AuthTokenPayload'] = ResolversParentTypes['AuthTokenPayload']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  stripeConnectAccount?: Resolver<ResolversTypes['AuthTokenPayloadStripeConnectAccountInfo'], ParentType, ContextType>;
  stripeCustomerID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['AuthTokenPayloadSubscriptionInfo']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthTokenPayloadStripeConnectAccountInfoResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['AuthTokenPayloadStripeConnectAccountInfo'] = ResolversParentTypes['AuthTokenPayloadStripeConnectAccountInfo']> = ResolversObject<{
  chargesEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  detailsSubmitted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payoutsEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthTokenPayloadSubscriptionInfoResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['AuthTokenPayloadSubscriptionInfo'] = ResolversParentTypes['AuthTokenPayloadSubscriptionInfo']> = ResolversObject<{
  currentPeriodEnd?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CancelWorkOrderResponseResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['CancelWorkOrderResponse'] = ResolversParentTypes['CancelWorkOrderResponse']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeleteMutationResponse' | 'WorkOrder', ParentType, ContextType>;
}>;

export type ChecklistItemResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['ChecklistItem'] = ResolversParentTypes['ChecklistItem']> = ResolversObject<{
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Contact'] = ResolversParentTypes['Contact']> = ResolversObject<{
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

export type DeleteMutationResponseResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['DeleteMutationResponse'] = ResolversParentTypes['DeleteMutationResponse']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  wasDeleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface EmailScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Email'], any> {
  name: 'Email';
}

export type FixitUserResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['FixitUser'] = ResolversParentTypes['FixitUser']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Contact' | 'User', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type GenericSuccessResponseResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['GenericSuccessResponse'] = ResolversParentTypes['GenericSuccessResponse']> = ResolversObject<{
  wasSuccessful?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvoiceResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  assignedTo?: Resolver<ResolversTypes['FixitUser'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['FixitUser'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InvoiceStatus'], ParentType, ContextType>;
  stripePaymentIntentID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  workOrder?: Resolver<Maybe<ResolversTypes['WorkOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LocationResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = ResolversObject<{
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  streetLine1?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  streetLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _root?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  cancelWorkOrder?: Resolver<ResolversTypes['CancelWorkOrderResponse'], ParentType, ContextType, RequireFields<MutationCancelWorkOrderArgs, 'workOrderID'>>;
  createContact?: Resolver<ResolversTypes['Contact'], ParentType, ContextType, RequireFields<MutationCreateContactArgs, 'contactUserID'>>;
  createInvite?: Resolver<ResolversTypes['GenericSuccessResponse'], ParentType, ContextType, RequireFields<MutationCreateInviteArgs, 'phoneOrEmail'>>;
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

export type MyInvoicesQueryReturnTypeResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['MyInvoicesQueryReturnType'] = ResolversParentTypes['MyInvoicesQueryReturnType']> = ResolversObject<{
  assignedToUser?: Resolver<Array<ResolversTypes['Invoice']>, ParentType, ContextType>;
  createdByUser?: Resolver<Array<ResolversTypes['Invoice']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MyWorkOrdersQueryReturnTypeResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['MyWorkOrdersQueryReturnType'] = ResolversParentTypes['MyWorkOrdersQueryReturnType']> = ResolversObject<{
  assignedToUser?: Resolver<Array<ResolversTypes['WorkOrder']>, ParentType, ContextType>;
  createdByUser?: Resolver<Array<ResolversTypes['WorkOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfileResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = ResolversObject<{
  businessName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  familyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  photoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _root?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact?: Resolver<ResolversTypes['Contact'], ParentType, ContextType, RequireFields<QueryContactArgs, 'contactID'>>;
  getUserByHandle?: Resolver<Maybe<ResolversTypes['Contact']>, ParentType, ContextType, RequireFields<QueryGetUserByHandleArgs, 'handle'>>;
  invoice?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType, RequireFields<QueryInvoiceArgs, 'invoiceID'>>;
  myContacts?: Resolver<Array<ResolversTypes['Contact']>, ParentType, ContextType>;
  myInvoices?: Resolver<ResolversTypes['MyInvoicesQueryReturnType'], ParentType, ContextType>;
  myProfile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  mySubscription?: Resolver<ResolversTypes['UserSubscription'], ParentType, ContextType>;
  myWorkOrders?: Resolver<ResolversTypes['MyWorkOrdersQueryReturnType'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType, RequireFields<QueryProfileArgs, 'profileID'>>;
  searchForUsersByHandle?: Resolver<Array<ResolversTypes['Contact']>, ParentType, ContextType, RequireFields<QuerySearchForUsersByHandleArgs, 'handle' | 'limit' | 'offset'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  workOrder?: Resolver<ResolversTypes['WorkOrder'], ParentType, ContextType, RequireFields<QueryWorkOrderArgs, 'workOrderID'>>;
}>;

export type UserResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  expoPushToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  stripeConnectAccount?: Resolver<Maybe<ResolversTypes['UserStripeConnectAccount']>, ParentType, ContextType>;
  stripeCustomerID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['UserSubscription']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserStripeConnectAccountResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['UserStripeConnectAccount'] = ResolversParentTypes['UserStripeConnectAccount']> = ResolversObject<{
  chargesEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  detailsSubmitted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payoutsEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSubscriptionResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['UserSubscription'] = ResolversParentTypes['UserSubscription']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentPeriodEnd?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priceID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkOrderResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['WorkOrder'] = ResolversParentTypes['WorkOrder']> = ResolversObject<{
  assignedTo?: Resolver<Maybe<ResolversTypes['FixitUser']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['WorkOrderCategory']>, ParentType, ContextType>;
  checklist?: Resolver<Maybe<Array<Maybe<ResolversTypes['ChecklistItem']>>>, ParentType, ContextType>;
  contractorNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['FixitUser'], ParentType, ContextType>;
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

export type Resolvers<ContextType = ApolloServerResolverContext> = ResolversObject<{
  AuthTokenPayload?: AuthTokenPayloadResolvers<ContextType>;
  AuthTokenPayloadStripeConnectAccountInfo?: AuthTokenPayloadStripeConnectAccountInfoResolvers<ContextType>;
  AuthTokenPayloadSubscriptionInfo?: AuthTokenPayloadSubscriptionInfoResolvers<ContextType>;
  CancelWorkOrderResponse?: CancelWorkOrderResponseResolvers<ContextType>;
  ChecklistItem?: ChecklistItemResolvers<ContextType>;
  Contact?: ContactResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteMutationResponse?: DeleteMutationResponseResolvers<ContextType>;
  Email?: GraphQLScalarType;
  FixitUser?: FixitUserResolvers<ContextType>;
  GenericSuccessResponse?: GenericSuccessResponseResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  Location?: LocationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MyInvoicesQueryReturnType?: MyInvoicesQueryReturnTypeResolvers<ContextType>;
  MyWorkOrdersQueryReturnType?: MyWorkOrdersQueryReturnTypeResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserStripeConnectAccount?: UserStripeConnectAccountResolvers<ContextType>;
  UserSubscription?: UserSubscriptionResolvers<ContextType>;
  WorkOrder?: WorkOrderResolvers<ContextType>;
}>;

