import { eventEmitter } from "@events";
import type { Model } from "@lib/dynamoDB";
import type { ContactType } from "./types";

// function, not arrow, bc we need "this" to be the Contact model
export const createOne = async function (
  this: InstanceType<typeof Model>,
  { userID, contactUserID }: CreateContactInput
) {
  const newContact = await this.createItem({
    userID,
    contactUserID
  });

  // If Contact gets an event to emit for onCreate handling, that will go here.

  return newContact;
};

type CreateContactInput = Pick<ContactType, "userID" | "contactUserID">;
