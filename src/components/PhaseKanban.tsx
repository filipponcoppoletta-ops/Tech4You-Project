"use client";

import React, { useState } from "react";
import { useProject } from "@/lib/ProjectContext";
import { KanbanTask, KanbanTaskStatus, Phase } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, ArrowLeft, Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

const STATUSES: KanbanTaskStatus[] = ['Da Fare', 'In Corso', 'Completato'];

export function PhaseKanban({ phase, onBack }: { phase: Phase, onBack: () => void }) {
    const { kanbanTasks, addKanbanTask, updateKanbanTaskStatus, updateKanbanTask, deleteKanbanTask, resources } = useProject();

    const phaseTasks = kanbanTasks.filter(t => t.phaseId === phase.id);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskAssigneeId, setNewTaskAssigneeId] = useState("");
    const [newTaskStatus, setNewTaskStatus] = useState<KanbanTaskStatus>('Da Fare');

    const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // allow drop
    };

    const handleDrop = (e: React.DragEvent, status: KanbanTaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
            updateKanbanTaskStatus(taskId, status);
        }
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        addKanbanTask({
            phaseId: phase.id,
            title: newTaskTitle,
            status: newTaskStatus,
            assigneeId: newTaskAssigneeId || undefined
        });
        setNewTaskTitle("");
        setNewTaskAssigneeId("");
        setNewTaskStatus('Da Fare');
        setIsAddModalOpen(false);
    };

    const handleEditTask = () => {
        if (!editingTask || !editingTask.title.trim()) return;
        updateKanbanTask(editingTask.id, {
            title: editingTask.title,
            assigneeId: editingTask.assigneeId,
            status: editingTask.status
        });
        setEditingTask(null);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{phase.name}</h2>
                        <p className="text-sm text-muted-foreground">Kanban Board</p>
                    </div>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Title</Label>
                                <Input className="col-span-3" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Status</Label>
                                <Select value={newTaskStatus} onValueChange={(val: KanbanTaskStatus) => setNewTaskStatus(val)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Assignee</Label>
                                <Select value={newTaskAssigneeId} onValueChange={setNewTaskAssigneeId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select resource" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {resources.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleAddTask}>Add Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                {STATUSES.map(status => (
                    <div
                        key={status}
                        className="flex flex-col bg-muted/30 rounded-lg p-4 border border-border"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        <h3 className="font-semibold mb-4 flex items-center justify-between">
                            {status}
                            <Badge variant="secondary" className="font-mono">
                                {phaseTasks.filter(t => t.status === status).length}
                            </Badge>
                        </h3>

                        <div className="flex flex-col gap-3 flex-1">
                            {phaseTasks.filter(t => t.status === status).map(task => {
                                const assignee = resources.find(r => r.id === task.assigneeId);
                                return (
                                    <Card
                                        key={task.id}
                                        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                    >
                                        <CardContent className="p-4 flex flex-col gap-3 relative">
                                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTask(task)}>
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteKanbanTask(task.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="font-medium text-sm pr-12">{task.title}</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="text-xs text-muted-foreground mr-auto">
                                                    #{task.id.slice(-4)}
                                                </div>
                                                {assignee ? (
                                                    <div className="flex items-center gap-2" title={assignee.name}>
                                                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] uppercase ring-1 ring-primary/20">
                                                            {assignee.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-muted border border-dashed flex items-center justify-center text-[10px] text-muted-foreground" title="Unassigned">
                                                        ?
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Task Modal */}
            <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    {editingTask && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Title</Label>
                                <Input className="col-span-3" value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Status</Label>
                                <Select value={editingTask.status} onValueChange={(val: KanbanTaskStatus) => setEditingTask({ ...editingTask, status: val })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Assignee</Label>
                                <Select value={editingTask.assigneeId || "none"} onValueChange={(val) => setEditingTask({ ...editingTask, assigneeId: val === "none" ? undefined : val })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select resource" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {resources.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
                        <Button onClick={handleEditTask}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
