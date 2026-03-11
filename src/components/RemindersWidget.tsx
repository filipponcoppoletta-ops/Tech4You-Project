"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Bell, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { useProject } from "@/lib/ProjectContext";
import { differenceInDays, parseISO, isPast } from "date-fns";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

export function RemindersWidget() {
    const { phases, resources } = useProject();
    const [isSending, setIsSending] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

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

    const openEmailDialog = () => {
        // Pre-select all resources with emails
        const allEmails = resources.filter(r => r.email).map(r => r.email);
        setSelectedRecipients(allEmails);
        setIsEmailDialogOpen(true);
    };

    const toggleRecipient = (email: string) => {
        if (selectedRecipients.includes(email)) {
            setSelectedRecipients(prev => prev.filter(e => e !== email));
        } else {
            setSelectedRecipients(prev => [...prev, email]);
        }
    };

    const handleSendReminder = () => {
        setIsSending(true);

        // Generate mailto link
        const to = selectedRecipients.join(',');
        const subject = encodeURIComponent(`Aggiornamenti Scadenze Progetto Tech4You`);

        let bodyText = `Ciao Team,\n\nEcco un riepilogo delle scadenze imminenti o scadute:\n\n`;
        reminders.forEach(r => {
            const assigneeName = resources.find(res => res.id === r.assigneeId)?.name || 'Nessun assegnatario';
            const statusText = r.isOverdue ? "SCADUTO" : `In scadenza tra ${r.daysRef} giorni`;
            bodyText += `- ${r.name} (${statusText})\n  Scadenza: ${r.date}\n  Assegnato a: ${assigneeName}\n\n`;
        });
        bodyText += `Per favore, verificate lo stato di queste attività.\n\nGrazie!`;

        const body = encodeURIComponent(bodyText);
        const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;

        // Open default mail client
        window.open(mailtoLink, '_self');

        setTimeout(() => {
            setIsSending(false);
            setIsEmailDialogOpen(false);
            setToastMessage("Client email aperto e pronto per l'invio!");
            setTimeout(() => setToastMessage(null), 4000);
        }, 500);
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
                        onClick={openEmailDialog}
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

            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invia Alert Scadenze</DialogTitle>
                        <DialogDescription>
                            Seleziona i membri del team a cui inviare &apos;{reminders.length}&apos; avvisi via email. Verrà aperto il tuo client di posta.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {resources.filter(r => r.email).length === 0 ? (
                            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md shrink-0">
                                Nessun membro del team ha un indirizzo email configurato in Risorse.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                                {resources.filter(r => r.email).map(resource => (
                                    <div key={resource.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`recipient-${resource.id}`}
                                            checked={selectedRecipients.includes(resource.email)}
                                            onCheckedChange={() => toggleRecipient(resource.email)}
                                            className="shrink-0"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor={`recipient-${resource.id}`} className="font-medium cursor-pointer">
                                                {resource.name} <span className="text-xs text-muted-foreground ml-1">({resource.role})</span>
                                            </Label>
                                            <p className="text-sm text-muted-foreground">{resource.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Annulla</Button>
                        <Button
                            onClick={handleSendReminder}
                            disabled={selectedRecipients.length === 0}
                        >
                            Componi Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
