"use client";

import { useProject } from "@/lib/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Edit2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";

export function TimelineSummary() {
    const { projectInfo, updateProjectInfo } = useProject();

    const [editData, setEditData] = useState({
        title: projectInfo.title,
        startDate: projectInfo.startDate,
        endDate: projectInfo.endDate,
    });

    const [isOpen, setIsOpen] = useState(false);

    const start = new Date(projectInfo.startDate);
    const end = new Date(projectInfo.endDate);
    const today = new Date('2026-04-10'); // Mocked "today" for demonstration

    const totalDays = differenceInDays(end, start);
    const elapsedDays = Math.max(0, differenceInDays(today, start));
    const progress = Math.min(100, (elapsedDays / totalDays) * 100);

    const handleSave = () => {
        updateProjectInfo(editData);
        setIsOpen(false);
    };

    return (
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                    <CardTitle className="text-2xl font-bold tracking-tight">{projectInfo.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Badge variant={projectInfo.status === 'Completed' ? 'success' : 'default'}>
                            {projectInfo.status}
                        </Badge>
                        <span className="text-xs opacity-75">Project Timeline Overview</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Clock className="h-6 w-6 text-primary" />
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 mt-2">
                                <Edit2 className="h-3 w-3" />
                                Edit Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Project Info</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Project Title</Label>
                                    <Input
                                        id="name"
                                        className="col-span-3"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="startDate" className="text-right">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        className="col-span-3"
                                        value={editData.startDate}
                                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="endDate" className="text-right">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        className="col-span-3"
                                        value={editData.endDate}
                                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleSave}>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-6 flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border flex-1">
                            <CalendarIcon className="h-5 w-5 text-blue-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Start Date</span>
                                <span className="font-medium">{format(start, 'MMMM do, yyyy')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border flex-1">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">End Date</span>
                                <span className="font-medium">{format(end, 'MMMM do, yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">Time Elapsed</span>
                            <span className="font-bold">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-xs text-muted-foreground text-right">
                            {totalDays > 0 ? `${totalDays - elapsedDays} days remaining` : 'Invalid dates'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
