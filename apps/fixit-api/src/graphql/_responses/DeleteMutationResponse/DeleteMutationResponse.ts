import {
  MutationResponse,
  type MutationResponseParams,
} from "@/graphql/_responses/MutationResponse";
import type { DeleteMutationResponse as DeleteMutationResponseType } from "@/types/graphql.js";

/**
 * A mutation response class for delete operations.
 */
export class DeleteMutationResponse extends MutationResponse implements DeleteMutationResponseType {
  id: string;

  constructor({ success, id }: DeleteMutationResponseParams) {
    super({ success });
    this.id = id;
  }
}

/**
 * Constructor params for a {@link DeleteMutationResponse}.
 */
export type DeleteMutationResponseParams = MutationResponseParams & {
  id: string;
};
