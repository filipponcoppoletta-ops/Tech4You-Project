import { CalendarEvent, Phase, ProjectInfo, RaciTask, Resource, KanbanTask } from './types';

export const mockProjectInfo: ProjectInfo = {
    title: 'Tech4You Platform Development',
    startDate: '2026-03-01',
    endDate: '2026-06-30',
    status: 'In Progress',
};

export const mockResources: Resource[] = [
    { id: 'r1', name: 'Alice Rossi', role: 'Project Manager', email: 'alice.rossi@example.com' },
    { id: 'r2', name: 'Bob Bianchi', role: 'Lead Developer', email: 'bob.bianchi@example.com' },
    { id: 'r3', name: 'Charlie Verdi', role: 'UI/UX Designer', email: 'charlie.verdi@example.com' },
    { id: 'r4', name: 'Diana Neri', role: 'QA Engineer', email: 'diana.neri@example.com' },
];

export const mockPhases: Phase[] = [
    { id: 'p1', name: 'Requirements Analysis', startDate: '2026-03-01', endDate: '2026-03-15', progress: 100, assigneeId: 'r1' },
    { id: 'p2', name: 'UI/UX Design', startDate: '2026-03-16', endDate: '2026-04-10', progress: 80, assigneeId: 'r3' },
    { id: 'p3', name: 'Frontend Development', startDate: '2026-04-01', endDate: '2026-05-15', progress: 30, assigneeId: 'r2' },
    { id: 'p4', name: 'Backend Integration', startDate: '2026-04-15', endDate: '2026-05-30', progress: 10, assigneeId: 'r2' },
    { id: 'p5', name: 'Testing & QA', startDate: '2026-05-15', endDate: '2026-06-15', progress: 0, assigneeId: 'r4' },
];

export const mockRaciMatrix: RaciTask[] = [
    { id: 't1', taskName: 'Define Requirements', roles: { 'r1': 'A', 'r2': 'C', 'r3': 'C', 'r4': 'I' } },
    { id: 't2', taskName: 'Design Mockups', roles: { 'r1': 'A', 'r2': 'I', 'r3': 'R', 'r4': 'I' } },
    { id: 't3', taskName: 'Develop Frontend', roles: { 'r1': 'A', 'r2': 'R', 'r3': 'C', 'r4': 'I' } },
    { id: 't4', taskName: 'Develop Backend API', roles: { 'r1': 'A', 'r2': 'R', 'r3': 'I', 'r4': 'I' } },
    { id: 't5', taskName: 'Execute Test Cases', roles: { 'r1': 'A', 'r2': 'I', 'r3': 'I', 'r4': 'R' } },
];

export const mockCalendarEvents: CalendarEvent[] = [
    { id: 'e1', title: 'Design Review', date: '2026-03-25', type: 'Meeting' },
    { id: 'e2', title: 'Frontend Alpha Release', date: '2026-04-30', type: 'Milestone' },
    { id: 'e3', title: 'Backend API Freeze', date: '2026-05-20', type: 'Deadline' },
    { id: 'e4', title: 'Final QA sign-off', date: '2026-06-15', type: 'Deadline' },
];

export const mockKanbanTasks: KanbanTask[] = [
    { id: 'k1', phaseId: 'p1', title: 'Scrivere testo email', status: 'Da Fare', assigneeId: 'r1' },
    { id: 'k2', phaseId: 'p1', title: 'Riunione con cliente', status: 'In Corso', assigneeId: 'r2' },
    { id: 'k3', phaseId: 'p1', title: 'Definire scope', status: 'Completato', assigneeId: 'r1' },
    { id: 'k4', phaseId: 'p2', title: 'Creare wireframe', status: 'Da Fare', assigneeId: 'r3' },
    { id: 'k5', phaseId: 'p3', title: 'Setup progetto React', status: 'Completato', assigneeId: 'r2' },
];
