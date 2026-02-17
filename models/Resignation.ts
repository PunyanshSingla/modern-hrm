import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResignation extends Document {
  employeeId: mongoose.Types.ObjectId;
  resignationDate: Date;
  lastWorkingDay: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
  noticePeriod: number; // in days
  adminRemarks?: string;
  exitInterviewDate?: Date;
  clearedByIT: boolean;
  clearedByFinance: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResignationSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  resignationDate: { type: Date, default: Date.now, required: true },
  lastWorkingDay: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Withdrawn'],
    default: 'Pending'
  },
  noticePeriod: { type: Number, default: 30 },
  adminRemarks: { type: String },
  exitInterviewDate: { type: Date },
  clearedByIT: { type: Boolean, default: false },
  clearedByFinance: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Check if model is already compiled
if (mongoose.models.Resignation) {
    if (process.env.NODE_ENV === 'development') {
        delete mongoose.models.Resignation;
    }
}

const Resignation: Model<IResignation> = mongoose.models.Resignation || mongoose.model<IResignation>('Resignation', ResignationSchema);

export default Resignation;
