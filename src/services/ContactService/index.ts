import { createContact } from "./createContact.js";
import { findContactByID } from "./findContactByID.js";

/**
 * #### ContactService
 *
 * This object contains methods which implement business logic for operations
 * related to users' Contacts.
 */
export const ContactService = {
  createContact,
  findContactByID,
} as const;
