"use client";

import { useProject } from "@/lib/ProjectContext";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ListTodo, Trash2, Plus, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChecklistsWidget() {
    const { checklists, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useProject();
    const [newItemText, setNewItemText] = useState("");

    const handleAddItem = () => {
        if (newItemText.trim()) {
            addChecklistItem(newItemText.trim());
            setNewItemText("");
        }
    };

    const completedCount = checklists.filter(c => c.completed).length;
    const totalCount = checklists.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <Card className="shadow-sm border-border/60 h-full flex flex-col">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <ListTodo className="h-5 w-5 text-primary" />
                            Project Checklists
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Track global tasks and to-dos
                        </CardDescription>
                    </div>
                    {totalCount > 0 && (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{progress}%</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completed</div>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex gap-2">
                    <Input
                        placeholder="Add new task..."
                        value={newItemText}
                        onChange={e => setNewItemText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                        className="flex-1"
                    />
                    <Button onClick={handleAddItem} disabled={!newItemText.trim()}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0">
                {checklists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <ListTodo className="h-10 w-10 text-muted-foreground mb-3 opacity-30" />
                        <h3 className="font-semibold text-foreground">No tasks yet</h3>
                        <p className="text-sm mt-1 max-w-xs">Create checklists to stay on top of the project's minor tasks.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {checklists.map(item => (
                            <div
                                key={item.id}
                                className={cn(
                                    "p-4 flex items-start gap-3 transition-colors hover:bg-muted/30 group",
                                    item.completed ? "bg-muted/10" : ""
                                )}
                            >
                                <button
                                    onClick={() => toggleChecklistItem(item.id)}
                                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                >
                                    {item.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="h-5 w-5" />
                                    )}
                                </button>

                                <span className={cn(
                                    "flex-1 text-sm leading-relaxed transition-all",
                                    item.completed ? "text-muted-foreground line-through opacity-70" : "text-foreground font-medium"
                                )}>
                                    {item.text}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => deleteChecklistItem(item.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
