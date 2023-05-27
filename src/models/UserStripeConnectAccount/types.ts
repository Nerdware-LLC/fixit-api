export type InternalDbUserStripeConnectAccount = {
  userID?: string;
  sk: string;
  id: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};
