import { User } from "./user.model";

export interface Ticket {
    id?: number;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    creator?: User;
    assignedTo?: User;
    createdDate?: Date;
    updatedDate?: Date;
    assignedToName: string;
    creatorName: string;
  }
  
  export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
  }
  
  export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'  
  }
