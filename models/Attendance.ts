import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
  approvalStatus: 'Approved' | 'Rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  date: { type: Date, required: true },
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }
  },
  status: { 
      type: String, 
      enum: ['Present', 'Absent', 'Half Day', 'On Leave'],
      default: 'Present'
  },
  approvalStatus: {
      type: String,
      enum: ['Approved', 'Rejected'],
      default: 'Approved'
  },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

// Add indexes for performance
AttendanceSchema.index({ employeeId: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ employeeId: 1, date: 1 }); // Composite index for common queries

// Check if model is already compiled
const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
