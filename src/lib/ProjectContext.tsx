"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ProjectInfo, Phase, Resource, RaciTask, CalendarEvent, KanbanTask, KanbanTaskStatus, RaciRoleType } from "./types";
import { supabase } from "./supabase";

interface ProjectContextType {
    projectInfo: ProjectInfo;
    setProjectInfo: React.Dispatch<React.SetStateAction<ProjectInfo>>;
    phases: Phase[];
    setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
    resources: Resource[];
    setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
    raciMatrix: RaciTask[];
    setRaciMatrix: React.Dispatch<React.SetStateAction<RaciTask[]>>;
    calendarEvents: CalendarEvent[];
    kanbanTasks: KanbanTask[];
    setKanbanTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>;
    isLoading: boolean;

    // Specific Handlers
    updateProjectInfo: (info: Partial<ProjectInfo>) => Promise<void>;
    addPhase: (phase: Omit<Phase, 'id'>) => Promise<void>;
    updatePhase: (id: string, phase: Partial<Phase>) => Promise<void>;
    deletePhase: (id: string) => Promise<void>;
    addResource: (resource: Resource) => Promise<void>;
    updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
    deleteResource: (id: string) => Promise<void>;
    updateRaciTaskRole: (taskId: string, resourceId: string, role: RaciRoleType) => Promise<void>;
    addRaciTask: (taskName: string) => Promise<void>;
    updateRaciTask: (id: string, taskName: string) => Promise<void>;
    deleteRaciTask: (id: string) => Promise<void>;

    // Kanban Handlers
    addKanbanTask: (task: Omit<KanbanTask, 'id'>) => Promise<void>;
    updateKanbanTaskStatus: (id: string, status: KanbanTaskStatus) => Promise<void>;
    updateKanbanTask: (id: string, updates: Partial<KanbanTask>) => Promise<void>;
    deleteKanbanTask: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const PROJECT_ID = '00000000-0000-0000-0000-000000000001';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ title: 'Loading...', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Pending' });
    const [phases, setPhases] = useState<Phase[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [raciMatrix, setRaciMatrix] = useState<RaciTask[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        async function fetchAllData() {
            try {
                const [projectRes, resourcesRes, phasesRes, raciTasksRes, raciRolesRes, kanbanRes] = await Promise.all([
                    supabase.from('project_info').select('*').eq('id', PROJECT_ID).single(),
                    supabase.from('resources').select('*'),
                    supabase.from('phases').select('*').eq('project_id', PROJECT_ID).order('start_date', { ascending: true }),
                    supabase.from('raci_tasks').select('*').eq('project_id', PROJECT_ID),
                    supabase.from('raci_roles').select('*'),
                    supabase.from('kanban_tasks').select('*')
                ]);

                if (projectRes.data) {
                    setProjectInfo({
                        title: projectRes.data.title,
                        startDate: projectRes.data.start_date,
                        endDate: projectRes.data.end_date,
                        status: projectRes.data.status
                    });
                }

                if (resourcesRes.data) setResources(resourcesRes.data);

                if (phasesRes.data) {
                    setPhases(phasesRes.data.map(p => ({
                        id: p.id,
                        name: p.name,
                        startDate: p.start_date,
                        endDate: p.end_date,
                        progress: p.progress,
                        assigneeId: p.assignee_id || ''
                    })));
                }

                if (kanbanRes.data) {
                    setKanbanTasks(kanbanRes.data.map(k => ({
                        id: k.id,
                        phaseId: k.phase_id,
                        title: k.title,
                        status: k.status,
                        assigneeId: k.assignee_id || ''
                    })));
                }

                if (raciTasksRes.data && raciRolesRes.data) {
                    const mappedRaci: RaciTask[] = raciTasksRes.data.map(t => {
                        const taskRoles = raciRolesRes.data.filter(r => r.task_id === t.id);
                        const rolesMap: Record<string, RaciRoleType> = {};
                        taskRoles.forEach(r => {
                            rolesMap[r.resource_id] = r.role as RaciRoleType;
                        });
                        return {
                            id: t.id,
                            taskName: t.task_name,
                            roles: rolesMap
                        };
                    });
                    setRaciMatrix(mappedRaci);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAllData();
    }, []);

    // Derived Calendar Events from Phases and Project Info
    useEffect(() => {
        if (!projectInfo || !projectInfo.startDate) return;

        const events: CalendarEvent[] = [
            { id: 'proj-start', title: 'Start: ' + projectInfo.title, date: projectInfo.startDate, type: 'Milestone' },
            { id: 'proj-end', title: 'End: ' + projectInfo.title, date: projectInfo.endDate, type: 'Deadline' }
        ];

        phases.forEach(p => {
            events.push({ id: `ph-start-${p.id}`, title: `Start: ${p.name}`, date: p.startDate, type: 'Milestone' });
            events.push({ id: `ph-end-${p.id}`, title: `Deadline: ${p.name}`, date: p.endDate, type: 'Deadline' });
        });

        setCalendarEvents(events);
    }, [projectInfo, phases]);

    // Handlers
    const updateProjectInfo = async (info: Partial<ProjectInfo>) => {
        const payload: any = {};
        if (info.title !== undefined) payload.title = info.title;
        if (info.startDate !== undefined) payload.start_date = info.startDate;
        if (info.endDate !== undefined) payload.end_date = info.endDate;
        if (info.status !== undefined) payload.status = info.status;

        const { error } = await supabase.from('project_info').update(payload).eq('id', PROJECT_ID);
        if (!error) {
            setProjectInfo(prev => ({ ...prev, ...info }));
        }
    };

    const addPhase = async (phase: Omit<Phase, 'id'>) => {
        const id = `p-${Date.now()}`;
        const payload = {
            id,
            project_id: PROJECT_ID,
            name: phase.name,
            start_date: phase.startDate,
            end_date: phase.endDate,
            progress: phase.progress,
            assignee_id: phase.assigneeId || null
        };
        const { error } = await supabase.from('phases').insert(payload);
        if (!error) {
            setPhases(prev => [...prev, { ...phase, id }]);
        }
    };

    const updatePhase = async (id: string, partial: Partial<Phase>) => {
        const payload: any = {};
        if (partial.name !== undefined) payload.name = partial.name;
        if (partial.startDate !== undefined) payload.start_date = partial.startDate;
        if (partial.endDate !== undefined) payload.end_date = partial.endDate;
        if (partial.progress !== undefined) payload.progress = partial.progress;
        if (partial.assigneeId !== undefined) payload.assignee_id = partial.assigneeId || null;

        const { error } = await supabase.from('phases').update(payload).eq('id', id);
        if (!error) {
            setPhases(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p));
        }
    };

    const deletePhase = async (id: string) => {
        const { error } = await supabase.from('phases').delete().eq('id', id);
        if (!error) {
            setPhases(prev => prev.filter(p => p.id !== id));
        }
    };

    const addResource = async (resource: Resource) => {
        const { error } = await supabase.from('resources').insert({
            id: resource.id,
            name: resource.name,
            role: resource.role,
            email: resource.email
        });
        if (!error) {
            setResources(prev => [...prev, resource]);
        }
    };

    const updateResource = async (id: string, partial: Partial<Resource>) => {
        const { error } = await supabase.from('resources').update(partial).eq('id', id);
        if (!error) {
            setResources(prev => prev.map(r => r.id === id ? { ...r, ...partial } : r));
        }
    };

    const deleteResource = async (id: string) => {
        const { error } = await supabase.from('resources').delete().eq('id', id);
        if (!error) {
            setResources(prev => prev.filter(r => r.id !== id));
            setRaciMatrix(prev => prev.map(task => {
                const newRoles = { ...task.roles };
                delete newRoles[id];
                return { ...task, roles: newRoles };
            }));
        }
    };

    const updateRaciTaskRole = async (taskId: string, resourceId: string, role: RaciRoleType) => {
        if (role === null) {
            const { error } = await supabase.from('raci_roles').delete().match({ task_id: taskId, resource_id: resourceId });
            if (!error) {
                updateLocalRaciState(taskId, resourceId, null);
            }
        } else {
            const { error } = await supabase.from('raci_roles').upsert({
                task_id: taskId,
                resource_id: resourceId,
                role
            });
            if (!error) {
                updateLocalRaciState(taskId, resourceId, role);
            }
        }
    };

    const updateLocalRaciState = (taskId: string, resourceId: string, role: RaciRoleType) => {
        setRaciMatrix(prev => prev.map(t => {
            if (t.id === taskId) {
                const newRoles = { ...t.roles };
                if (role === null) {
                    delete newRoles[resourceId];
                } else {
                    newRoles[resourceId] = role;
                }
                return { ...t, roles: newRoles };
            }
            return t;
        }));
    };

    const addRaciTask = async (taskName: string) => {
        const id = `task-${Date.now()}`;
        const { error } = await supabase.from('raci_tasks').insert({
            id,
            project_id: PROJECT_ID,
            task_name: taskName
        });
        if (!error) {
            setRaciMatrix(prev => [...prev, { id, taskName, roles: {} }]);
        }
    };

    const updateRaciTask = async (id: string, taskName: string) => {
        const { error } = await supabase.from('raci_tasks').update({ task_name: taskName }).eq('id', id);
        if (!error) {
            setRaciMatrix(prev => prev.map(t => t.id === id ? { ...t, taskName } : t));
        }
    };

    const deleteRaciTask = async (id: string) => {
        const { error } = await supabase.from('raci_tasks').delete().eq('id', id);
        if (!error) {
            setRaciMatrix(prev => prev.filter(t => t.id !== id));
        }
    };

    const addKanbanTask = async (task: Omit<KanbanTask, 'id'>) => {
        const id = `kanban-${Date.now()}`;
        const payload = {
            id,
            phase_id: task.phaseId,
            title: task.title,
            status: task.status,
            assignee_id: task.assigneeId || null
        };
        const { error } = await supabase.from('kanban_tasks').insert(payload);
        if (!error) {
            setKanbanTasks(prev => [...prev, { ...task, id }]);
        }
    };

    const updateKanbanTaskStatus = async (id: string, status: KanbanTaskStatus) => {
        const { error } = await supabase.from('kanban_tasks').update({ status }).eq('id', id);
        if (!error) {
            setKanbanTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        }
    };

    const updateKanbanTask = async (id: string, updates: Partial<KanbanTask>) => {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.assigneeId !== undefined) payload.assignee_id = updates.assigneeId || null;

        const { error } = await supabase.from('kanban_tasks').update(payload).eq('id', id);
        if (!error) {
            setKanbanTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        }
    };

    const deleteKanbanTask = async (id: string) => {
        const { error } = await supabase.from('kanban_tasks').delete().eq('id', id);
        if (!error) {
            setKanbanTasks(prev => prev.filter(t => t.id !== id));
        }
    };

    return (
        <ProjectContext.Provider value={{
            projectInfo, setProjectInfo, updateProjectInfo,
            phases, setPhases, addPhase, updatePhase, deletePhase,
            resources, setResources, addResource, updateResource, deleteResource,
            raciMatrix, setRaciMatrix, updateRaciTaskRole, addRaciTask, updateRaciTask, deleteRaciTask,
            calendarEvents,
            kanbanTasks, setKanbanTasks, addKanbanTask, updateKanbanTaskStatus, updateKanbanTask, deleteKanbanTask,
            isLoading
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
