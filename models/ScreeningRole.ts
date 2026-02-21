import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScreeningRole extends Document {
  name: string;
  skills: string[];
  description: string;
  isPredefined: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningRoleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  skills: { type: [String], required: true },
  description: { type: String, required: true },
  isPredefined: { type: Boolean, default: false }
}, {
  timestamps: true
});

const ScreeningRole: Model<IScreeningRole> = mongoose.models.ScreeningRole || mongoose.model<IScreeningRole>('ScreeningRole', ScreeningRoleSchema);

export default ScreeningRole;
