import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ApolloServerResolverContext } from '../apolloServer';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Custom DateTime scalar; pass a string or js date instance obj */
  DateTime: any;
  /** Custom Email scalar; validates using regex */
  Email: any;
};

export type CancelWorkOrderResponse = DeleteMutationResponse | WorkOrder;

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  description: Scalars['String'];
  id: Scalars['ID'];
  isCompleted: Scalars['Boolean'];
};

export type Contact = FixitUser & {
  __typename?: 'Contact';
  createdAt: Scalars['DateTime'];
  email: Scalars['Email'];
  id: Scalars['ID'];
  phone: Scalars['String'];
  profile: Profile;
};

export type CreateChecklistItemInput = {
  description: Scalars['String'];
};

export type CreateWorkOrderInput = {
  assignedToUserID?: InputMaybe<Scalars['ID']>;
  category?: InputMaybe<WorkOrderCategory>;
  checklist?: InputMaybe<Array<InputMaybe<CreateChecklistItemInput>>>;
  description: Scalars['String'];
  dueDate?: InputMaybe<Scalars['DateTime']>;
  entryContact?: InputMaybe<Scalars['String']>;
  entryContactPhone?: InputMaybe<Scalars['String']>;
  location: CreateWorkOrderLocationInput;
  priority?: InputMaybe<WorkOrderPriority>;
  scheduledDateTime?: InputMaybe<Scalars['DateTime']>;
};

export type CreateWorkOrderLocationInput = {
  city: Scalars['String'];
  country?: InputMaybe<Scalars['String']>;
  region: Scalars['String'];
  streetLine1: Scalars['String'];
  streetLine2?: InputMaybe<Scalars['String']>;
};

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse';
  id: Scalars['ID'];
  wasDeleted: Scalars['Boolean'];
};

export type FixitUser = {
  createdAt: Scalars['DateTime'];
  email: Scalars['Email'];
  id: Scalars['ID'];
  phone: Scalars['String'];
  profile: Profile;
};

export type Invoice = {
  __typename?: 'Invoice';
  amount: Scalars['Int'];
  assignedTo: FixitUser;
  createdAt: Scalars['DateTime'];
  createdBy: FixitUser;
  id: Scalars['ID'];
  status: InvoiceStatus;
  stripePaymentIntentID?: Maybe<Scalars['String']>;
  workOrder?: Maybe<WorkOrder>;
};

export type InvoiceInput = {
  amount: Scalars['Int'];
  assignedToUserID: Scalars['ID'];
  workOrderID?: InputMaybe<Scalars['ID']>;
};

export enum InvoiceStatus {
  Closed = 'CLOSED',
  Disputed = 'DISPUTED',
  Open = 'OPEN'
}

export type Mutation = {
  __typename?: 'Mutation';
  _root?: Maybe<Scalars['Boolean']>;
  cancelWorkOrder: CancelWorkOrderResponse;
  createContact: Contact;
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
  workOrderID: Scalars['ID'];
};


export type MutationCreateContactArgs = {
  contactEmail: Scalars['Email'];
};


export type MutationCreateInvoiceArgs = {
  invoice: InvoiceInput;
};


export type MutationCreateWorkOrderArgs = {
  workOrder: CreateWorkOrderInput;
};


export type MutationDeleteContactArgs = {
  contactEmail: Scalars['Email'];
};


export type MutationDeleteInvoiceArgs = {
  invoiceID: Scalars['ID'];
};


export type MutationPayInvoiceArgs = {
  invoiceID: Scalars['ID'];
};


export type MutationSetWorkOrderStatusCompleteArgs = {
  workOrderID: Scalars['ID'];
};


export type MutationUpdateInvoiceAmountArgs = {
  amount: Scalars['Int'];
  invoiceID: Scalars['ID'];
};


export type MutationUpdateProfileArgs = {
  profile: ProfileInput;
};


export type MutationUpdateWorkOrderArgs = {
  workOrder: UpdateWorkOrderInput;
  workOrderID: Scalars['ID'];
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

export type PhoneContact = {
  __typename?: 'PhoneContact';
  businessName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['Email']>;
  familyName?: Maybe<Scalars['String']>;
  givenName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  isUser: Scalars['Boolean'];
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  photoUrl?: Maybe<Scalars['String']>;
};

export type Profile = {
  __typename?: 'Profile';
  businessName?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  familyName?: Maybe<Scalars['String']>;
  givenName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  photoUrl?: Maybe<Scalars['String']>;
};

export type ProfileInput = {
  businessName?: InputMaybe<Scalars['String']>;
  familyName?: InputMaybe<Scalars['String']>;
  givenName?: InputMaybe<Scalars['String']>;
  photoUrl?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  _root?: Maybe<Scalars['Boolean']>;
  contact: Contact;
  invoice: Invoice;
  myContacts: Array<Maybe<Contact>>;
  myInvoices: MyInvoicesQueryReturnType;
  myProfile: Profile;
  mySubscription: UserSubscription;
  myWorkOrders: MyWorkOrdersQueryReturnType;
  profile: Profile;
  searchUsers?: Maybe<Array<Maybe<PhoneContact>>>;
  user: User;
  workOrder: WorkOrder;
};


export type QueryContactArgs = {
  contactID: Scalars['ID'];
};


export type QueryInvoiceArgs = {
  invoiceID: Scalars['ID'];
};


export type QueryProfileArgs = {
  profileID: Scalars['ID'];
};


export type QuerySearchUsersArgs = {
  rawPhoneContacts: Array<RawPhoneContactInput>;
};


export type QueryWorkOrderArgs = {
  workOrderID: Scalars['ID'];
};

export type RawPhoneContactInput = {
  email?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  photoUrl?: InputMaybe<Scalars['String']>;
};

export type StripeConnectAccount = {
  __typename?: 'StripeConnectAccount';
  chargesEnabled: Scalars['Boolean'];
  detailsSubmitted: Scalars['Boolean'];
  id: Scalars['ID'];
  payoutsEnabled: Scalars['Boolean'];
};

export enum SubscriptionStatus {
  Active = 'active',
  Canceled = 'canceled',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
  PastDue = 'past_due',
  Trialing = 'trialing',
  Unpaid = 'unpaid'
}

export type UpdateChecklistItemInput = {
  description: Scalars['String'];
  id?: InputMaybe<Scalars['ID']>;
  isCompleted?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateWorkOrderInput = {
  assignedToUserID?: InputMaybe<Scalars['ID']>;
  category?: InputMaybe<WorkOrderCategory>;
  checklist?: InputMaybe<Array<InputMaybe<UpdateChecklistItemInput>>>;
  description?: InputMaybe<Scalars['String']>;
  dueDate?: InputMaybe<Scalars['DateTime']>;
  entryContact?: InputMaybe<Scalars['String']>;
  entryContactPhone?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<UpdateWorkOrderLocationInput>;
  priority?: InputMaybe<WorkOrderPriority>;
  scheduledDateTime?: InputMaybe<Scalars['DateTime']>;
};

export type UpdateWorkOrderLocationInput = {
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  region?: InputMaybe<Scalars['String']>;
  streetLine1?: InputMaybe<Scalars['String']>;
  streetLine2?: InputMaybe<Scalars['String']>;
};

export type User = FixitUser & {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email: Scalars['Email'];
  id: Scalars['ID'];
  phone: Scalars['String'];
  profile: Profile;
  stripeConnectAccount?: Maybe<StripeConnectAccount>;
  stripeCustomerID: Scalars['String'];
  subscription?: Maybe<UserSubscription>;
};

export type UserSubscription = {
  __typename?: 'UserSubscription';
  createdAt: Scalars['DateTime'];
  currentPeriodEnd: Scalars['DateTime'];
  id: Scalars['ID'];
  priceID: Scalars['String'];
  productID: Scalars['String'];
  status: SubscriptionStatus;
};

export type WorkOrder = {
  __typename?: 'WorkOrder';
  assignedTo?: Maybe<FixitUser>;
  category?: Maybe<WorkOrderCategory>;
  checklist?: Maybe<Array<Maybe<ChecklistItem>>>;
  contractorNotes?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  createdBy: FixitUser;
  description: Scalars['String'];
  dueDate?: Maybe<Scalars['DateTime']>;
  entryContact?: Maybe<Scalars['String']>;
  entryContactPhone?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  invoice?: Maybe<Invoice>;
  location: WorkOrderLocation;
  priority: WorkOrderPriority;
  scheduledDateTime?: Maybe<Scalars['DateTime']>;
  status: WorkOrderStatus;
};

export enum WorkOrderCategory {
  Drywall = 'DRYWALL',
  Electrical = 'ELECTRICAL',
  Flooring = 'FLOORING',
  General = 'GENERAL',
  Hvac = 'HVAC',
  Landscaping = 'LANDSCAPING',
  Masonry = 'MASONRY',
  Painting = 'PAINTING',
  Paving = 'PAVING',
  Pest = 'PEST',
  Plumbing = 'PLUMBING',
  Roofing = 'ROOFING',
  Trash = 'TRASH',
  Turnover = 'TURNOVER',
  Windows = 'WINDOWS'
}

export type WorkOrderLocation = {
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  streetLine1?: Maybe<Scalars['String']>;
  streetLine2?: Maybe<Scalars['String']>;
};

export enum WorkOrderPriority {
  High = 'HIGH',
  Low = 'LOW',
  Normal = 'NORMAL'
}

export enum WorkOrderStatus {
  Assigned = 'ASSIGNED',
  Cancelled = 'CANCELLED',
  Complete = 'COMPLETE',
  Unassigned = 'UNASSIGNED'
}

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

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CancelWorkOrderResponse: ResolversTypes['DeleteMutationResponse'] | ResolversTypes['WorkOrder'];
  ChecklistItem: ResolverTypeWrapper<ChecklistItem>;
  Contact: ResolverTypeWrapper<Contact>;
  CreateChecklistItemInput: CreateChecklistItemInput;
  CreateWorkOrderInput: CreateWorkOrderInput;
  CreateWorkOrderLocationInput: CreateWorkOrderLocationInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteMutationResponse: ResolverTypeWrapper<DeleteMutationResponse>;
  Email: ResolverTypeWrapper<Scalars['Email']>;
  FixitUser: ResolversTypes['Contact'] | ResolversTypes['User'];
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Invoice: ResolverTypeWrapper<Invoice>;
  InvoiceInput: InvoiceInput;
  InvoiceStatus: InvoiceStatus;
  Mutation: ResolverTypeWrapper<{}>;
  MyInvoicesQueryReturnType: ResolverTypeWrapper<MyInvoicesQueryReturnType>;
  MyWorkOrdersQueryReturnType: ResolverTypeWrapper<MyWorkOrdersQueryReturnType>;
  PhoneContact: ResolverTypeWrapper<PhoneContact>;
  Profile: ResolverTypeWrapper<Profile>;
  ProfileInput: ProfileInput;
  Query: ResolverTypeWrapper<{}>;
  RawPhoneContactInput: RawPhoneContactInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  StripeConnectAccount: ResolverTypeWrapper<StripeConnectAccount>;
  SubscriptionStatus: SubscriptionStatus;
  UpdateChecklistItemInput: UpdateChecklistItemInput;
  UpdateWorkOrderInput: UpdateWorkOrderInput;
  UpdateWorkOrderLocationInput: UpdateWorkOrderLocationInput;
  User: ResolverTypeWrapper<User>;
  UserSubscription: ResolverTypeWrapper<UserSubscription>;
  WorkOrder: ResolverTypeWrapper<WorkOrder>;
  WorkOrderCategory: WorkOrderCategory;
  WorkOrderLocation: never;
  WorkOrderPriority: WorkOrderPriority;
  WorkOrderStatus: WorkOrderStatus;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  CancelWorkOrderResponse: ResolversParentTypes['DeleteMutationResponse'] | ResolversParentTypes['WorkOrder'];
  ChecklistItem: ChecklistItem;
  Contact: Contact;
  CreateChecklistItemInput: CreateChecklistItemInput;
  CreateWorkOrderInput: CreateWorkOrderInput;
  CreateWorkOrderLocationInput: CreateWorkOrderLocationInput;
  DateTime: Scalars['DateTime'];
  DeleteMutationResponse: DeleteMutationResponse;
  Email: Scalars['Email'];
  FixitUser: ResolversParentTypes['Contact'] | ResolversParentTypes['User'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Invoice: Invoice;
  InvoiceInput: InvoiceInput;
  Mutation: {};
  MyInvoicesQueryReturnType: MyInvoicesQueryReturnType;
  MyWorkOrdersQueryReturnType: MyWorkOrdersQueryReturnType;
  PhoneContact: PhoneContact;
  Profile: Profile;
  ProfileInput: ProfileInput;
  Query: {};
  RawPhoneContactInput: RawPhoneContactInput;
  String: Scalars['String'];
  StripeConnectAccount: StripeConnectAccount;
  UpdateChecklistItemInput: UpdateChecklistItemInput;
  UpdateWorkOrderInput: UpdateWorkOrderInput;
  UpdateWorkOrderLocationInput: UpdateWorkOrderLocationInput;
  User: User;
  UserSubscription: UserSubscription;
  WorkOrder: WorkOrder;
  WorkOrderLocation: never;
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
}>;

export type InvoiceResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  assignedTo?: Resolver<ResolversTypes['FixitUser'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['FixitUser'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InvoiceStatus'], ParentType, ContextType>;
  stripePaymentIntentID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  workOrder?: Resolver<Maybe<ResolversTypes['WorkOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _root?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  cancelWorkOrder?: Resolver<ResolversTypes['CancelWorkOrderResponse'], ParentType, ContextType, RequireFields<MutationCancelWorkOrderArgs, 'workOrderID'>>;
  createContact?: Resolver<ResolversTypes['Contact'], ParentType, ContextType, RequireFields<MutationCreateContactArgs, 'contactEmail'>>;
  createInvoice?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType, RequireFields<MutationCreateInvoiceArgs, 'invoice'>>;
  createWorkOrder?: Resolver<ResolversTypes['WorkOrder'], ParentType, ContextType, RequireFields<MutationCreateWorkOrderArgs, 'workOrder'>>;
  deleteContact?: Resolver<ResolversTypes['DeleteMutationResponse'], ParentType, ContextType, RequireFields<MutationDeleteContactArgs, 'contactEmail'>>;
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

export type PhoneContactResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['PhoneContact'] = ResolversParentTypes['PhoneContact']> = ResolversObject<{
  businessName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['Email']>, ParentType, ContextType>;
  familyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  photoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfileResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = ResolversObject<{
  businessName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  familyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  photoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _root?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contact?: Resolver<ResolversTypes['Contact'], ParentType, ContextType, RequireFields<QueryContactArgs, 'contactID'>>;
  invoice?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType, RequireFields<QueryInvoiceArgs, 'invoiceID'>>;
  myContacts?: Resolver<Array<Maybe<ResolversTypes['Contact']>>, ParentType, ContextType>;
  myInvoices?: Resolver<ResolversTypes['MyInvoicesQueryReturnType'], ParentType, ContextType>;
  myProfile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  mySubscription?: Resolver<ResolversTypes['UserSubscription'], ParentType, ContextType>;
  myWorkOrders?: Resolver<ResolversTypes['MyWorkOrdersQueryReturnType'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType, RequireFields<QueryProfileArgs, 'profileID'>>;
  searchUsers?: Resolver<Maybe<Array<Maybe<ResolversTypes['PhoneContact']>>>, ParentType, ContextType, RequireFields<QuerySearchUsersArgs, 'rawPhoneContacts'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  workOrder?: Resolver<ResolversTypes['WorkOrder'], ParentType, ContextType, RequireFields<QueryWorkOrderArgs, 'workOrderID'>>;
}>;

export type StripeConnectAccountResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['StripeConnectAccount'] = ResolversParentTypes['StripeConnectAccount']> = ResolversObject<{
  chargesEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  detailsSubmitted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payoutsEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  stripeConnectAccount?: Resolver<Maybe<ResolversTypes['StripeConnectAccount']>, ParentType, ContextType>;
  stripeCustomerID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['UserSubscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSubscriptionResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['UserSubscription'] = ResolversParentTypes['UserSubscription']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentPeriodEnd?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priceID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkOrderResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['WorkOrder'] = ResolversParentTypes['WorkOrder']> = ResolversObject<{
  assignedTo?: Resolver<Maybe<ResolversTypes['FixitUser']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['WorkOrderCategory']>, ParentType, ContextType>;
  checklist?: Resolver<Maybe<Array<Maybe<ResolversTypes['ChecklistItem']>>>, ParentType, ContextType>;
  contractorNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['FixitUser'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  entryContact?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entryContactPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType>;
  location?: Resolver<ResolversTypes['WorkOrderLocation'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['WorkOrderPriority'], ParentType, ContextType>;
  scheduledDateTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['WorkOrderStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkOrderLocationResolvers<ContextType = ApolloServerResolverContext, ParentType extends ResolversParentTypes['WorkOrderLocation'] = ResolversParentTypes['WorkOrderLocation']> = ResolversObject<{
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  streetLine1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  streetLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ApolloServerResolverContext> = ResolversObject<{
  CancelWorkOrderResponse?: CancelWorkOrderResponseResolvers<ContextType>;
  ChecklistItem?: ChecklistItemResolvers<ContextType>;
  Contact?: ContactResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteMutationResponse?: DeleteMutationResponseResolvers<ContextType>;
  Email?: GraphQLScalarType;
  FixitUser?: FixitUserResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MyInvoicesQueryReturnType?: MyInvoicesQueryReturnTypeResolvers<ContextType>;
  MyWorkOrdersQueryReturnType?: MyWorkOrdersQueryReturnTypeResolvers<ContextType>;
  PhoneContact?: PhoneContactResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StripeConnectAccount?: StripeConnectAccountResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserSubscription?: UserSubscriptionResolvers<ContextType>;
  WorkOrder?: WorkOrderResolvers<ContextType>;
  WorkOrderLocation?: WorkOrderLocationResolvers<ContextType>;
}>;
