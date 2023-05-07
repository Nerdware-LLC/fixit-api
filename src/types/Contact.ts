import type { UserType } from "./User";

export interface ContactType {
  userID: UserType["id"];
  sk?: string;
  contactUserID?: UserType["id"];
  handle?: UserType["handle"];
  email?: UserType["email"];
  phone?: UserType["phone"];
  profile?: UserType["profile"];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactPublicFieldsType {
  userID: UserType["id"];
  handle: UserType["handle"];
  email: UserType["email"];
  phone: UserType["phone"];
  profile: UserType["profile"];
  createdAt: Date;
  updatedAt: Date;
}
