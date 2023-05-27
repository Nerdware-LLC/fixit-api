import type { InternalDbProfile } from "../Profile/types";

// TODO Have separate aliased/unaliased types

export type InternalDbContact = {
  /** The primary-key attribute */
  pk?: string;
  /** Alias for the `pk` attribute */
  userID: string;
  /** The sort-key attribute */
  sk?: string;
  /** Alias for `sk` attribute */
  id: string;
  contactUserID: string;
  handle: string;
  email?: string;
  phone?: string;
  profile?: InternalDbProfile;
  createdAt: Date;
  updatedAt: Date;
};
