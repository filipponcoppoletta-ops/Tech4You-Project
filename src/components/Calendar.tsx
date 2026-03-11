"use client";

import { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/ProjectContext";
import { Link as LinkIcon, Check } from "lucide-react";

export function Calendar() {
    const { projectInfo, phases } = useProject();

    // Use project start date or current date for initial month view
    const initialDate = projectInfo.startDate ? new Date(projectInfo.startDate) : new Date("2026-04-01");
    const [currentDate, setCurrentDate] = useState(initialDate);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const [copied, setCopied] = useState(false);

    const handleCopyFeed = () => {
        const url = `${window.location.origin}/api/calendar`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

    return (
        <Card className="flex flex-col h-full border-border/60 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Project Calendar
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm" className="hidden sm:flex" onClick={handleCopyFeed}>
                            {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                            {copied ? "Copied!" : "Sync Calendar"}
                        </Button>
                        <div className="flex items-center gap-1 border-l pl-3 ml-1">
                            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-sm w-32 text-center">
                                {format(currentDate, dateFormat)}
                            </span>
                            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-muted-foreground mb-2 px-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-1">{d}</div>
                    ))}
                </div>

                {/* Fill empty days at start of month */}
                <div className="grid grid-cols-7 gap-1 flex-1">
                    {Array.from({ length: startDate.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[80px] rounded-md bg-secondary/20 border border-transparent" />
                    ))}

                    {days.map((day) => {
                        const dayEvents = generatedEvents.filter(e => isSameDay(parseISO(e.date), day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isDayToday = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[80px] p-1 border rounded-md flex flex-col transition-colors",
                                    !isCurrentMonth ? "bg-secondary/20 text-muted-foreground border-transparent" : "bg-card border-border/50",
                                    isDayToday && "border-primary ring-1 ring-primary/20",
                                    dayEvents.length > 0 && "cursor-pointer hover:bg-muted/50"
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

                                <div className="mt-1 flex flex-col gap-1 overflow-hidden px-0.5">
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
        </Card >
    );
}
