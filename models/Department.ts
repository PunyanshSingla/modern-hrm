import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  managerId?: mongoose.Types.ObjectId;
  leaveBalances: {
    leaveTypeId: mongoose.Types.ObjectId | string;
    balance: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  leaveBalances: [{
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType' },
    balance: { type: Number, default: 0 }
  }],
}, {
  timestamps: true
});

// Check if model is already compiled


const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
