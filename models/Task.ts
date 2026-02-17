import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  assigneeIds: mongoose.Types.ObjectId[]; // Array of employee IDs
  departmentId?: mongoose.Types.ObjectId;  // Optional department-wide assignment
  projectId?: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  assigneeIds: [{ type: Schema.Types.ObjectId, ref: 'EmployeeProfile' }],
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Review', 'Completed'],
    default: 'To Do'
  },
  dueDate: { type: Date }
}, {
  timestamps: true
});

// Check if model is already compiled
if (mongoose.models.Task) {
    if (process.env.NODE_ENV === 'development') {
        delete mongoose.models.Task;
    }
}

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
