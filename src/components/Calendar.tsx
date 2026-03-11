"use client";

import { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/ProjectContext";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function Calendar() {
    const { projectInfo, phases, resources, addKanbanTask } = useProject();
    const [isExpanded, setIsExpanded] = useState(false);

    // New Task Dialog State
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskPhaseId, setNewTaskPhaseId] = useState("");
    const [newTaskAssigneeId, setNewTaskAssigneeId] = useState("");
    const [taskStartTime, setTaskStartTime] = useState("09:00");
    const [taskEndTime, setTaskEndTime] = useState("18:00");

    // Use current date for initial month view so it stays on the current month when refreshing
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Dynamically generate events from project data
    const generatedEvents = useMemo(() => {
        const evts: CalendarEvent[] = [];

        // Project Start and End
        if (projectInfo.startDate) {
            evts.push({ id: 'proj-start', title: 'Project Start', date: projectInfo.startDate, type: 'Milestone' });
        }
        if (projectInfo.endDate) {
            evts.push({ id: 'proj-end', title: 'Project End', date: projectInfo.endDate, type: 'Deadline' });
        }

        // Phase Milestones
        phases.forEach(p => {
            evts.push({ id: `phase-start-${p.id}`, title: `Start: ${p.name}`, date: p.startDate, type: 'Milestone' });
            evts.push({ id: `phase-end-${p.id}`, title: `End: ${p.name}`, date: p.endDate, type: 'Deadline' });
        });

        return evts;
    }, [projectInfo, phases]);

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setNewTaskTitle("");
        setNewTaskPhaseId("");
        setNewTaskAssigneeId("");
        setTaskStartTime("09:00");
        setTaskEndTime("18:00");
        setIsTaskDialogOpen(true);
    };

    const handleCreateTask = async () => {
        if (!selectedDate || !newTaskTitle.trim() || !newTaskPhaseId) return;

        const validAssignee = newTaskAssigneeId && newTaskAssigneeId !== "unassigned" ? newTaskAssigneeId : undefined;

        try {
            await addKanbanTask({
                title: newTaskTitle.trim(),
                phaseId: newTaskPhaseId,
                assigneeId: validAssignee,
                status: 'Da Fare',
                startDate: `${format(selectedDate, "yyyy-MM-dd")}T${taskStartTime}:00`,
                endDate: `${format(selectedDate, "yyyy-MM-dd")}T${taskEndTime}:00`,
            });
            setIsTaskDialogOpen(false);
        } catch (err) {
            console.error(err);
            alert("Errore durante la creazione del task.");
        }
    };

    const calendarContent = (
        <Card className={cn("flex flex-col h-full border-border/60 shadow-sm", isExpanded && "border-none shadow-none rounded-none")}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Project Calendar
                    </CardTitle>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 sm:mr-2 text-muted-foreground hover:text-foreground">
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 shrink-0">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-sm min-w-[110px] text-center shrink-0">
                            {format(currentDate, dateFormat)}
                        </span>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 shrink-0">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-muted-foreground mb-2 px-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-1">{d}</div>
                    ))}
                </div>

                {/* Fill empty days at start of month */}
                <div className={cn("grid grid-cols-7 gap-1 flex-1", isExpanded ? "auto-rows-fr min-h-[500px]" : "")}>
                    {Array.from({ length: startDate.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className={cn("rounded-md bg-secondary/20 border border-transparent", !isExpanded && "min-h-[80px]")} />
                    ))}

                    {days.map((day) => {
                        const dayEvents = generatedEvents.filter(e => isSameDay(parseISO(e.date), day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isDayToday = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "p-1 border rounded-md flex flex-col transition-colors overflow-hidden cursor-pointer hover:border-primary/50 group",
                                    !isExpanded && "min-h-[80px]",
                                    !isCurrentMonth ? "bg-secondary/20 text-muted-foreground border-transparent" : "bg-card border-border/50 hover:bg-muted/30",
                                    isDayToday && "border-primary ring-1 ring-primary/20",
                                    dayEvents.length > 0 && "hover:bg-muted/50"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mt-0.5 ml-0.5",
                                        isDayToday ? "bg-primary text-primary-foreground" : "text-foreground/80"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-1" />
                                    )}
                                </div>

                                <div className="mt-1 flex flex-col gap-1 overflow-y-auto px-0.5 pb-1">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "text-[10px] leading-tight px-1.5 py-1 rounded-sm font-medium truncate",
                                                event.type === 'Deadline' ? "bg-destructive/10 text-destructive border border-destructive/20" :
                                                    event.type === 'Meeting' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                                                        "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                            )}
                                            title={event.title}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );

    if (isExpanded) {
        return (
            <>
                <Card className="flex flex-col h-full border-border/60 shadow-sm opacity-50">
                    <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                        <Button variant="outline" onClick={() => setIsExpanded(false)}>Calendar is Expanded</Button>
                    </CardContent>
                </Card>
                <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                    <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 flex flex-col overflow-hidden [&>button]:hidden">
                        <DialogTitle className="sr-only">Expanded Calendar</DialogTitle>
                        {calendarContent}
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <>
            {calendarContent}

            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a task for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="task-title">Task Title</Label>
                            <Input
                                id="task-title"
                                placeholder="E.g. Review documentation"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task-phase">Project Phase</Label>
                            <Select value={newTaskPhaseId} onValueChange={setNewTaskPhaseId}>
                                <SelectTrigger id="task-phase">
                                    <SelectValue placeholder="Select phase..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {phases.map(phase => (
                                        <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="task-start-time">Inizio</Label>
                                <Input
                                    id="task-start-time"
                                    type="time"
                                    value={taskStartTime}
                                    onChange={(e) => setTaskStartTime(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task-end-time">Fine</Label>
                                <Input
                                    id="task-end-time"
                                    type="time"
                                    value={taskEndTime}
                                    onChange={(e) => setTaskEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task-assignee">Assignee (Optional)</Label>
                            <Select value={newTaskAssigneeId} onValueChange={setNewTaskAssigneeId}>
                                <SelectTrigger id="task-assignee">
                                    <SelectValue placeholder="Select team member..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {resources.map(res => (
                                        <SelectItem key={res.id} value={res.id}>
                                            {res.name} <span className="text-muted-foreground text-xs ml-1">({res.role})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreateTask}
                            disabled={!newTaskTitle.trim() || !newTaskPhaseId}
                        >
                            Create Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
