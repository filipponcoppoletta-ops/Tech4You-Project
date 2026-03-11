"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Bell, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { useProject } from "@/lib/ProjectContext";
import { differenceInDays, parseISO, isPast } from "date-fns";
import { cn } from "@/lib/utils";

export function RemindersWidget() {
    const { phases, resources } = useProject();
    const [isSending, setIsSending] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Identify upcoming or overdue items
    const today = new Date();

    const reminders = phases
        .filter(p => p.progress < 100) // only incomplete phases
        .map(p => {
            const pDate = parseISO(p.endDate);
            const daysDiff = differenceInDays(pDate, today);
            return {
                id: p.id,
                name: p.name,
                date: p.endDate,
                daysRef: daysDiff,
                isOverdue: isPast(pDate),
                assigneeId: p.assigneeId
            };
        })
        .filter(r => r.daysRef <= 7) // Due within 7 days or overdue
        .sort((a, b) => a.daysRef - b.daysRef);

    const handleSendReminder = () => {
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            setIsSending(false);
            setToastMessage("Notifiche email inviate con successo a tutto il team!");

            // Auto-hide toast after 4 seconds
            setTimeout(() => {
                setToastMessage(null);
            }, 4000);
        }, 1500);
    };

    return (
        <Card className="shadow-sm border-border/60 relative overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Bell className="h-5 w-5 text-amber-500" />
                            Reminders & Alerts
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Upcoming deadlines within 7 days
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        variant="default"
                        disabled={reminders.length === 0 || isSending}
                        onClick={handleSendReminder}
                        className="flex items-center gap-1.5"
                    >
                        {isSending ? (
                            <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-1" />
                        ) : (
                            <Mail className="h-4 w-4" />
                        )}
                        {isSending ? 'Sending...' : 'Send Alerts'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1 overflow-y-auto">
                {/* Simple inline toast */}
                {toastMessage && (
                    <div className="mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md p-3 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {toastMessage}
                    </div>
                )}

                {reminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6 text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2 opacity-50" />
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs mt-1">No upcoming deadlines.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reminders.map(rem => (
                            <div
                                key={rem.id}
                                className={cn(
                                    "p-3 rounded-md border flex flex-col gap-1 transition-colors",
                                    rem.isOverdue
                                        ? "bg-destructive/5 text-destructive border-destructive/20"
                                        : "bg-amber-500/5 text-amber-700 border-amber-500/20"
                                )}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="font-semibold text-sm line-clamp-1">{rem.name}</div>
                                    <div className={cn(
                                        "text-xs font-bold whitespace-nowrap px-1.5 py-0.5 rounded-sm",
                                        rem.isOverdue ? "bg-destructive/10" : "bg-amber-500/10"
                                    )}>
                                        {rem.isOverdue ? "Overdue" : rem.daysRef === 0 ? "Today" : `In ${rem.daysRef}d`}
                                    </div>
                                </div>
                                <div className="flex items-center text-xs opacity-80 justify-between">
                                    <span className="font-medium truncate mr-2">Assignee: {resources.find(r => r.id === rem.assigneeId)?.name || 'Unassigned'}</span>
                                    <span>{rem.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
