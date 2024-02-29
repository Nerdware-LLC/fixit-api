import type { DeleteMutationResponse as DeleteMutationResponseType } from "@/types/graphql.js";

export class DeleteMutationResponse implements DeleteMutationResponseType {
  id: string;
  wasDeleted: boolean;

  constructor({ id, wasDeleted }: { id: string; wasDeleted: boolean }) {
    this.id = id;
    this.wasDeleted = wasDeleted;
  }
}
