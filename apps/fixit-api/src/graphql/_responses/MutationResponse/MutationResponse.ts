import type { MutationResponse as MutationResponseType } from "@/types/graphql.js";

/**
 * A generic mutation response class.
 */
export class MutationResponse implements MutationResponseType {
  success: boolean;

  constructor({ success }: MutationResponseParams) {
    this.success = success;
  }
}

/**
 * Constructor params for a {@link MutationResponse}.
 */
export type MutationResponseParams = {
  success: boolean;
};
