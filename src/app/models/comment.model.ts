import { User } from "./user.model";

export interface Comment {
    id?: number;
    content: string;
    ticketId: number;
    author?: User;
    createdDate?: Date;
    updatedDate?: Date;
    authorName?: string;
  }
