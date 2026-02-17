import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  managerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

// Check if model is already compiled


const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
