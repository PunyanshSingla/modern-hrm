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
    { id: "To Do", label: "To Do", color: "bg-slate-500/10 text-slate-600" },
    { id: "In Progress", label: "In Progress", color: "bg-amber-500/10 text-amber-600" },
    { id: "Review", label: "Review", color: "bg-blue-500/10 text-blue-600" },
    { id: "Completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-600" }
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
            <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] custom-scrollbar">
                {statusColumns.map(col => (
                    <div key={col.id} className="flex-1 min-w-[300px] flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={cn("rounded-full px-3 py-1 font-black uppercase text-[10px] tracking-widest border-none", col.color)}>
                                    {col.label}
                                </Badge>
                                <span className="text-xs font-bold text-muted-foreground">{getColumnTasks(col.id).length}</span>
                            </div>
                        </div>

                        <Droppable droppableId={col.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={cn(
                                        "flex-1 rounded-[32px] p-4 transition-all duration-300 min-h-[500px]",
                                        snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20 ring-dashed" : "bg-muted/30"
                                    )}
                                >
                                    <div className="space-y-4">
                                        {getColumnTasks(col.id).map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={isReadOnly}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={cn(
                                                            "transition-transform",
                                                            snapshot.isDragging ? "scale-105 z-50 rotate-2" : ""
                                                        )}
                                                    >
                                                        <Card className="rounded-3xl border-2 border-muted-foreground/10 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-card">
                                                            <CardContent className="p-5 space-y-4">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <h4 className="font-black text-sm leading-tight uppercase tracking-tight">{task.title}</h4>
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-[9px] font-black uppercase tracking-tighter px-2",
                                                                        task.priority === 'Urgent' ? 'border-rose-500 text-rose-600' :
                                                                        task.priority === 'High' ? 'border-orange-500 text-orange-600' :
                                                                        'border-muted-foreground/20 text-muted-foreground'
                                                                    )}>
                                                                        {task.priority}
                                                                    </Badge>
                                                                </div>

                                                                {task.description && (
                                                                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 italic">
                                                                        {task.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex flex-wrap gap-2">
                                                                    {task.projectId && (
                                                                        <Badge variant="outline" className="text-[9px] font-bold uppercase bg-primary/5 text-primary border-primary/20">
                                                                            {task.projectId.name}
                                                                        </Badge>
                                                                    )}
                                                                    {task.departmentId && (
                                                                        <Badge variant="outline" className="text-[9px] font-bold uppercase bg-amber-500/5 text-amber-600 border-amber-500/20 flex items-center gap-1">
                                                                            <Building2 className="h-2 w-2" /> {task.departmentId.name}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                                                                    <div className="flex -space-x-2">
                                                                        {task.assigneeIds?.filter(asg => asg && asg._id).map((assignee) => (
                                                                            <Avatar key={assignee._id} className="h-6 w-6 border-2 border-background ring-2 ring-primary/5" title={`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'Unknown'}>
                                                                                <AvatarFallback className="text-[8px] font-black bg-primary text-primary-foreground">
                                                                                    {assignee.firstName?.[0]?.toUpperCase() || ''}{assignee.lastName?.[0]?.toUpperCase() || (!assignee.firstName?.[0] ? '?' : '')}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                        ))}
                                                                        {(!task.assigneeIds || task.assigneeIds.length === 0) && task.departmentId && (
                                                                            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-background ring-2 ring-amber-500/5">
                                                                                <Users className="h-3 w-3 text-amber-600" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {task.dueDate && (
                                                                        <div className={cn(
                                                                            "flex items-center gap-1 text-[10px] font-bold",
                                                                            new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? "text-rose-500" : "text-muted-foreground"
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
                ))}
            </div>
        </DragDropContext>
    );
}
