"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Clock, 
    AlertCircle, 
    Calendar,
    Users,
    Building2,
    CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Task {
    _id: string;
    title: string;
    description?: string;
    assigneeIds?: {
        _id: string;
        firstName: string;
        lastName: string;
    }[];
    departmentId?: {
        _id: string;
        name: string;
    };
    projectId?: {
        _id: string;
        name: string;
    };
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
    dueDate?: string;
}

interface KanbanBoardProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStatus: string) => void;
    isReadOnly?: boolean;
}

const statusColumns = [
    { id: "To Do", label: "To Do", color: "bg-slate-500/10 text-slate-700 border-slate-500/20" },
    { id: "In Progress", label: "In Progress", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    { id: "Review", label: "Review", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
    { id: "Completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" }
];

export default function KanbanBoard({ tasks, onTaskMove, isReadOnly = false }: KanbanBoardProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const onDragEnd = (result: DropResult) => {
        if (isReadOnly) return;
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as Task['status'];
        
        // Optimistic update
        const updatedTasks = localTasks.map(t => 
            t._id === draggableId ? { ...t, status: newStatus } : t
        );
        setLocalTasks(updatedTasks);
        
        // Trigger server update
        onTaskMove(draggableId, newStatus);
    };

    const getColumnTasks = (status: string) => {
        return localTasks.filter(t => t.status === status);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5 overflow-x-auto pb-4 min-h-[600px] custom-scrollbar">
                {statusColumns.map(col => {
                    const colTasks = getColumnTasks(col.id);
                    return (
                        <div key={col.id} className="flex-1 min-w-[280px] max-w-[340px] flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5 border capitalize", col.color)}>
                                        {col.label}
                                    </Badge>
                                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground flex items-center justify-center border border-border/50">
                                        {colTasks.length}
                                    </span>
                                </div>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "flex-1 rounded-xl p-2.5 transition-colors border min-h-[520px] space-y-3",
                                            snapshot.isDraggingOver ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "bg-muted/30 border-border/40"
                                        )}
                                    >
                                        <div className="space-y-3">
                                            {colTasks.map((task, index) => (
                                                <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={isReadOnly}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={cn(
                                                                "transition-transform",
                                                                snapshot.isDragging ? "scale-[1.02] z-50 shadow-lg" : ""
                                                            )}
                                                        >
                                                            <Card className="rounded-xl border border-border bg-card shadow-xs hover:border-primary/30 transition-all group overflow-hidden">
                                                                <CardContent className="p-3.5 space-y-3">
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <h4 className="font-semibold text-sm text-foreground leading-snug tracking-tight">{task.title}</h4>
                                                                        <Badge variant="outline" className={cn(
                                                                            "text-[11px] font-medium px-2 py-0.5 border capitalize shrink-0",
                                                                            task.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' :
                                                                            task.priority === 'High' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                                                                            task.priority === 'Medium' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                                                                            'bg-slate-500/10 text-slate-700 border-slate-500/20'
                                                                        )}>
                                                                            {task.priority}
                                                                        </Badge>
                                                                    </div>

                                                                    {task.description && (
                                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                                                                            {task.description}
                                                                        </p>
                                                                    )}

                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {task.projectId && (
                                                                            <Badge variant="secondary" className="text-[11px] font-medium bg-primary/5 text-primary border border-primary/20 px-2 py-0">
                                                                                {task.projectId.name}
                                                                            </Badge>
                                                                        )}
                                                                        {task.departmentId && (
                                                                            <Badge variant="secondary" className="text-[11px] font-medium bg-muted/60 text-foreground border border-border/50 px-2 py-0 flex items-center gap-1">
                                                                                <Building2 className="h-3 w-3 text-muted-foreground" /> {task.departmentId.name}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                                                        <div className="flex -space-x-1.5">
                                                                            {task.assigneeIds?.filter(asg => asg && asg._id).map((assignee) => (
                                                                                <Avatar key={assignee._id} className="h-6 w-6 border border-background shadow-2xs" title={`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'Unknown'}>
                                                                                    <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                                                                                        {assignee.firstName?.[0]?.toUpperCase() || ''}{assignee.lastName?.[0]?.toUpperCase() || (!assignee.firstName?.[0] ? '?' : '')}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                            ))}
                                                                            {(!task.assigneeIds || task.assigneeIds.length === 0) && task.departmentId && (
                                                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-background">
                                                                                    <Users className="h-3 w-3 text-muted-foreground" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {task.dueDate && (
                                                                            <div className={cn(
                                                                                "flex items-center gap-1 text-[11px] font-medium",
                                                                                new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? "text-rose-600 font-semibold" : "text-muted-foreground"
                                                                            )}>
                                                                                <CalendarDays className="h-3 w-3" />
                                                                                {format(new Date(task.dueDate), "MMM d")}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
