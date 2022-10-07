import type { UserType } from "@models/User/types";

export interface ContactType {
  userID: UserType["id"];
  sk?: string;
  contactUserID?: UserType["id"]; // TODO Ensure this isn't publicly available in GQL API
  email?: UserType["email"];
  phone?: UserType["phone"];
  profile?: UserType["profile"];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactPublicFieldsType {
  userID: UserType["id"];
  email: UserType["email"];
  phone: UserType["phone"];
  profile: UserType["profile"];
  createdAt: Date;
  updatedAt: Date;
}
