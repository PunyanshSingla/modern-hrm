import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveType extends Document {
  name: string;
  description?: string;
  defaultAllowance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveTypeSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  defaultAllowance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Check if model is already compiled
if (mongoose.models.LeaveType) {
    if (process.env.NODE_ENV === 'development') {
        delete mongoose.models.LeaveType;
    }
}

const LeaveType: Model<ILeaveType> = mongoose.models.LeaveType || mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);

export default LeaveType;
