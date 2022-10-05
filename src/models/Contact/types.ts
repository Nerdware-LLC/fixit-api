import type { UserType } from "@models/User/types";

export interface ContactType {
  id: string;
  email: UserType["email"];
  phone: UserType["phone"];
  profile: UserType["profile"];
  createdAt: Date;
  updatedAt: Date;
}
