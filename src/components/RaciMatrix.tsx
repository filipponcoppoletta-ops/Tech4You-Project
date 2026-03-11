"use client";

import { useProject } from "@/lib/ProjectContext";
import { RaciTask, Resource, RaciRoleType } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Trash2, Edit2, Maximize2, Minimize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function RaciMatrix() {
    const { raciMatrix, resources, updateRaciTaskRole, addResource, deleteResource, addRaciTask, updateRaciTask, deleteRaciTask } = useProject();

    const [isExpanded, setIsExpanded] = useState(false);

    const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
    const [newResourceData, setNewResourceData] = useState<Partial<Resource>>({ name: "", role: "", email: "" });

    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskName, setEditTaskName] = useState("");
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingTaskId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingTaskId]);

    const getRoleColor = (role: RaciRoleType) => {
        switch (role) {
            case 'R': return 'bg-blue-100 text-blue-800 border-blue-200 shadow-sm';
            case 'A': return 'bg-red-100 text-red-800 border-red-200 shadow-sm';
            case 'C': return 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm';
            case 'I': return 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm';
            default: return 'bg-transparent text-transparent border-transparent hover:bg-muted';
        }
    };

    const cycleRole = (current: RaciRoleType): RaciRoleType => {
        if (!current) return 'R';
        if (current === 'R') return 'A';
        if (current === 'A') return 'C';
        if (current === 'C') return 'I';
        return null;
    };

    const handleRoleClick = (taskId: string, resourceId: string, currentRole: RaciRoleType) => {
        updateRaciTaskRole(taskId, resourceId, cycleRole(currentRole));
    };

    const handleAddResource = () => {
        if (newResourceData.name && newResourceData.role) {
            addResource({
                id: `r-${Date.now()}`,
                name: newResourceData.name,
                role: newResourceData.role,
                email: newResourceData.email || ""
            });
            setNewResourceData({ name: "", role: "", email: "" });
            setIsAddResourceOpen(false);
        }
    };

    const handleAddTask = () => {
        if (newTaskName.trim()) {
            addRaciTask(newTaskName.trim());
            setNewTaskName("");
            setIsAddTaskOpen(false);
        }
    };

    const saveEditTask = () => {
        if (editingTaskId && editTaskName.trim()) {
            updateRaciTask(editingTaskId, editTaskName.trim());
        }
        setEditingTaskId(null);
    };

    const raciContent = (
        <Card className={cn("shadow-sm border-border/60 flex flex-col h-full", isExpanded && "border-none shadow-none rounded-none")}>
            <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        RACI Matrix
                        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 ml-2 text-muted-foreground hover:text-foreground">
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    </CardTitle>
                    <CardDescription>Resource allocation grid. Click cells to cycle roles.</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                    {/* Add Task Dialog */}
                    <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="secondary" className="gap-1.5 h-8">
                                <Plus className="h-4 w-4" />
                                Add Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Task / Deliverable</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Task Name</Label>
                                    <Input
                                        className="col-span-3"
                                        value={newTaskName}
                                        onChange={e => setNewTaskName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleAddTask}>Add Task</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Resource Dialog */}
                    <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1.5 h-8">
                                <Plus className="h-4 w-4" />
                                Add Resource
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Resource</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <Input className="col-span-3" value={newResourceData.name} onChange={e => setNewResourceData({ ...newResourceData, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Role</Label>
                                    <Input className="col-span-3" value={newResourceData.role} onChange={e => setNewResourceData({ ...newResourceData, role: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Email</Label>
                                    <Input type="email" className="col-span-3" value={newResourceData.email} onChange={e => setNewResourceData({ ...newResourceData, email: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleAddResource}>Add Resource</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent className="overflow-x-auto flex-1 flex flex-col">
                <div className="rounded-xl border border-border/50 overflow-hidden min-w-full inline-block flex-1">
                    <Table className="w-full">
                        <TableHeader className="bg-muted/40 whitespace-nowrap">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[320px] font-semibold text-foreground py-3 sticky left-0 bg-muted/40 z-20">Task / Deliverable</TableHead>
                                {resources.map(resource => (
                                    <TableHead key={resource.id} className="text-center py-2 min-w-[120px] max-w-[150px] relative group border-l border-border/30">
                                        <Button
                                            variant="ghost" size="icon"
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 text-destructive hover:text-destructive transition-opacity"
                                            onClick={() => deleteResource(resource.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                        <div className="flex flex-col items-center gap-0.5 justify-center mt-2 px-6">
                                            <span className="font-medium text-foreground text-sm truncate w-full" title={resource.name}>{resource.name}</span>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider truncate w-full" title={resource.role}>{resource.role}</span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {raciMatrix.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={resources.length + 1} className="py-8 text-center text-muted-foreground">
                                        No tasks defined yet. Add a task to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                            {raciMatrix.map((task, index) => (
                                <TableRow key={task.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                                    <TableCell className="font-medium py-3 text-sm sticky left-0 z-10 group/task" style={{ backgroundColor: index % 2 === 0 ? "var(--background)" : "hsl(var(--muted)/0.1)" }}>
                                        {editingTaskId === task.id ? (
                                            <Input
                                                ref={editInputRef}
                                                className="h-8 text-sm w-full"
                                                value={editTaskName}
                                                onChange={e => setEditTaskName(e.target.value)}
                                                onBlur={saveEditTask}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') saveEditTask();
                                                    if (e.key === 'Escape') setEditingTaskId(null);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-between gap-2 pr-2">
                                                <span className="truncate" title={task.taskName}>{task.taskName}</span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                        onClick={() => {
                                                            setEditTaskName(task.taskName);
                                                            setEditingTaskId(task.id);
                                                        }}
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                        onClick={() => deleteRaciTask(task.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </TableCell>
                                    {resources.map(resource => {
                                        const role = task.roles[resource.id] as RaciRoleType;
                                        return (
                                            <TableCell key={resource.id} className="text-center py-2 px-1 cursor-pointer border-l border-border/30 hover:bg-muted/30 transition-colors" onClick={() => handleRoleClick(task.id, resource.id, role)}>
                                                <div className={`mx-auto inline-flex items-center justify-center w-8 h-8 rounded-sm border font-bold text-xs transition-colors ${getRoleColor(role)}`}>
                                                    {role || '+'}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium justify-center sm:justify-end text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-sm flex items-center justify-center font-bold bg-blue-100 text-blue-800 border border-blue-200">R</div> Responsible</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-sm flex items-center justify-center font-bold bg-red-100 text-red-800 border border-red-200">A</div> Accountable</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-sm flex items-center justify-center font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">C</div> Consulted</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-sm flex items-center justify-center font-bold bg-amber-100 text-amber-800 border border-amber-200">I</div> Informed</div>
                </div>
            </CardContent>
        </Card>
    );

    if (isExpanded) {
        return (
            <>
                <Card className="flex flex-col h-full border-border/60 shadow-sm opacity-50">
                    <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                        <Button variant="outline" onClick={() => setIsExpanded(false)}>RACI Matrix is Expanded</Button>
                    </CardContent>
                </Card>
                <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                    <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 flex flex-col overflow-hidden [&>button]:hidden">
                        <DialogTitle className="sr-only">Expanded RACI Matrix</DialogTitle>
                        {raciContent}
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <>
            {raciContent}
        </>
    );
}
