import { User } from "./user.model";

export interface Comment {
    id?: number;
    content: string;
    ticketId: number;
    createdBy?: User;
    createdAt?: Date;
    updatedAt?: Date;
  }
