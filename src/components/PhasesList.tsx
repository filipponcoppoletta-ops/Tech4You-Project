"use client";

import { useProject } from "@/lib/ProjectContext";
import { Phase } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Mail, Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { PhaseKanban } from "./PhaseKanban";

export function PhasesList() {
    const { phases, resources, addPhase, updatePhase, deletePhase } = useProject();

    const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPhaseData, setNewPhaseData] = useState<Partial<Phase>>({
        name: "", startDate: "", endDate: "", progress: 0, assigneeId: ""
    });

    const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

    const handleEditSave = () => {
        if (editingPhase) {
            updatePhase(editingPhase.id, editingPhase);
            setIsEditModalOpen(false);
        }
    };

    const handleAddSave = () => {
        if (!newPhaseData.name || !newPhaseData.startDate || !newPhaseData.endDate) return;
        addPhase({
            id: `p - ${Date.now()} `,
            name: newPhaseData.name,
            startDate: newPhaseData.startDate,
            endDate: newPhaseData.endDate,
            progress: Number(newPhaseData.progress) || 0,
            assigneeId: newPhaseData.assigneeId || ""
        });
        setNewPhaseData({ name: "", startDate: "", endDate: "", progress: 0, assigneeId: "" });
        setIsAddModalOpen(false);
    };

    if (selectedPhase) {
        return <PhaseKanban phase={selectedPhase} onBack={() => setSelectedPhase(null)} />;
    }

    return (
        <>
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                    Project Phases
                </h2>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Add Phase
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Phase</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input className="col-span-3" value={newPhaseData.name} onChange={e => setNewPhaseData({ ...newPhaseData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Start Date</Label>
                                <Input type="date" className="col-span-3" value={newPhaseData.startDate} onChange={e => setNewPhaseData({ ...newPhaseData, startDate: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">End Date</Label>
                                <Input type="date" className="col-span-3" value={newPhaseData.endDate} onChange={e => setNewPhaseData({ ...newPhaseData, endDate: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Progress %</Label>
                                <div className="col-span-3 flex items-center gap-3">
                                    <input
                                        type="range" min="0" max="100"
                                        className="w-full flex-1"
                                        value={newPhaseData.progress || 0}
                                        onChange={e => setNewPhaseData({ ...newPhaseData, progress: Number(e.target.value) })}
                                    />
                                    <span className="w-8 text-sm font-semibold text-right">{newPhaseData.progress || 0}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Assignee</Label>
                                <Select value={newPhaseData.assigneeId} onValueChange={(val) => setNewPhaseData({ ...newPhaseData, assigneeId: val })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select resource" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {resources.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleAddSave}>Add Phase</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {phases.map(phase => {
                    const assignee = resources.find(r => r.id === phase.assigneeId);

                    let statusVariant: "default" | "success" | "warning" | "secondary" = "default";
                    if (phase.progress === 100) statusVariant = "success";
                    else if (phase.progress === 0) statusVariant = "secondary";
                    else statusVariant = "warning";

                    const subject = encodeURIComponent(`Aggiornamento: ${phase.name} `);
                    const body = encodeURIComponent(`Ciao ${assignee?.name.split(' ')[0] || ''}, \n\nTi scrivo per avere un aggiornamento sulla fase "${phase.name}".La percentuale attuale di completamento è al ${phase.progress}%.\n\nGrazie, \n[Tuo Nome]`);

                    return (
                        <Card
                            key={phase.id}
                            className="flex flex-col hover:shadow-md transition-shadow duration-200 group cursor-pointer"
                            onClick={() => setSelectedPhase(phase)}
                        >
                            <CardHeader className="pb-3 gap-2 relative">
                                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/50 backdrop-blur-sm shadow-sm" onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPhase(phase);
                                        setIsEditModalOpen(true);
                                    }}>
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive bg-background/50 backdrop-blur-sm shadow-sm" onClick={(e) => {
                                        e.stopPropagation();
                                        deletePhase(phase.id);
                                    }}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="flex justify-between items-start pr-16">
                                    <CardTitle className="text-lg font-semibold leading-tight">{phase.name}</CardTitle>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant={statusVariant}>
                                        {phase.progress === 100 ? 'Done' : phase.progress === 0 ? 'Pending' : 'Active'}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground font-medium">
                                        {format(new Date(phase.startDate), 'MMM d')} - {format(new Date(phase.endDate), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <div className="mb-5">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-muted-foreground">Completion</span>
                                        <span className="font-bold">{phase.progress}%</span>
                                    </div>
                                    <Progress value={phase.progress} />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    {assignee ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0 ring-1 ring-primary/20">
                                                {assignee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col overflow-hidden max-w-[120px]">
                                                <span className="text-sm font-semibold truncate" title={assignee.name}>{assignee.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate" title={assignee.role}>{assignee.role}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground italic">Unassigned</div>
                                    )}

                                    {assignee && (
                                        <a
                                            href={`mailto:${assignee.email}?subject=${subject}&body=${body}`}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors group relative"
                                            title="Send Email Draft"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Mail className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Edit Phase Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Phase</DialogTitle>
                    </DialogHeader>
                    {editingPhase && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input className="col-span-3" value={editingPhase.name} onChange={e => setEditingPhase({ ...editingPhase, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Start Date</Label>
                                <Input type="date" className="col-span-3" value={editingPhase.startDate} onChange={e => setEditingPhase({ ...editingPhase, startDate: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">End Date</Label>
                                <Input type="date" className="col-span-3" value={editingPhase.endDate} onChange={e => setEditingPhase({ ...editingPhase, endDate: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Progress %</Label>
                                <div className="col-span-3 flex items-center gap-3">
                                    <input
                                        type="range" min="0" max="100"
                                        className="w-full flex-1"
                                        value={editingPhase.progress}
                                        onChange={e => setEditingPhase({ ...editingPhase, progress: Number(e.target.value) })}
                                    />
                                    <span className="w-8 text-sm font-semibold text-right">{editingPhase.progress}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Assignee</Label>
                                <Select value={editingPhase.assigneeId} onValueChange={(val) => setEditingPhase({ ...editingPhase, assigneeId: val })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select resource" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {resources.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleEditSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
