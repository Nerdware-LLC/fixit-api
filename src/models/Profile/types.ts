import type { Profile } from "@types";

export type InternalDbProfile = {
  [K in keyof Profile]: Exclude<Profile[K], null>;
};
