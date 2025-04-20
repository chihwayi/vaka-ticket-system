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
  contentType: ContentType;
  textContent?: string;
  imagePath?: string;
  audioPath?: string;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'  
}

export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO'
}