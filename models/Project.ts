import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Planned';
  startDate: Date;
  endDate: Date;
  
  // Assignments
  departmentId?: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  managerId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { 
      type: String, 
      enum: ['Active', 'Completed', 'On Hold', 'Planned'],
      default: 'Planned'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  teamMembers: [{ type: Schema.Types.ObjectId, ref: 'EmployeeProfile' }],
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

// Add indexes for performance
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ departmentId: 1 });
ProjectSchema.index({ createdAt: -1 });

// Check if model is already compiled


const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
