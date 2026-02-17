import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IITRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  type: 'Hardware' | 'Software' | 'Access' | 'Other';
  item: string; // e.g., "MacBook Pro", "Jira Access"
  reason: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress';
  rejectionReason?: string;
  requestDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ITRequestSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  type: { 
      type: String, 
      enum: ['Hardware', 'Software', 'Access', 'Other'], 
      required: true 
  },
  item: { type: String, required: true },
  reason: { type: String, required: true },
  priority: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'], 
      default: 'Medium' 
  },
  status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected', 'In Progress'],
      default: 'Pending'
  },
  rejectionReason: { type: String },
  requestDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Check if model is already compiled
const ITRequest: Model<IITRequest> = mongoose.models.ITRequest || mongoose.model<IITRequest>('ITRequest', ITRequestSchema);

export default ITRequest;
