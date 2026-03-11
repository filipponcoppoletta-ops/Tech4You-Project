export interface ProjectInfo {
  title: string;
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string;
  status: 'In Progress' | 'Completed' | 'Pending';
}

export interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  contentUrl?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number; // 0 to 100
  assigneeId: string;
}

export interface Resource {
  id: string; // The UI ID (e.g., 'r1')
  name: string;
  role: string;
  email: string;
  is_admin?: boolean;
  user_id?: string; // Supabase Auth UUID
}

export type RaciRoleType = 'R' | 'A' | 'C' | 'I' | null;

export interface RaciTask {
  id: string;
  taskName: string;
  roles: Record<string, RaciRoleType>; // Map resourceId -> RaciRoleType
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  type: 'Deadline' | 'Milestone' | 'Meeting';
  description?: string;
}

export type KanbanTaskStatus = 'Da Fare' | 'In Corso' | 'Completato';

export interface KanbanTask {
  id: string;
  phaseId: string;
  title: string;
  status: KanbanTaskStatus;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
}
