import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId | string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  managerId?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
  },
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

// Check if model is already compiled
if (mongoose.models.Leave) {
    if (process.env.NODE_ENV === 'development') {
        delete mongoose.models.Leave;
    }
}

const Leave: Model<ILeave> = mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
