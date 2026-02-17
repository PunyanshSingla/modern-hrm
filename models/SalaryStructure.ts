import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISalaryStructure extends Document {
  name: string;
  ctcAnnual: number;
  isActive: boolean;
  components: {
    label: string;
    type: 'Earning' | 'Deduction' | 'Employer Contribution';
    valueType: 'Fixed' | 'Percentage';
    value: number; // Amount or Percentage
    baseComponentId?: string; // e.g., HRA is 50% of Basic
    isTaxable: boolean;
    isStatutory: boolean; // PF/ESI applicable?
    statutoryRule?: 'PF_BASIC' | 'ESI_GROSS' | 'PT' | 'GRATUITY';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SalaryStructureSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  ctcAnnual: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  components: [{
    label: { type: String, required: true },
    type: { type: String, enum: ['Earning', 'Deduction', 'Employer Contribution'], required: true },
    valueType: { type: String, enum: ['Fixed', 'Percentage'], required: true },
    value: { type: Number, required: true },
    baseComponentId: { type: String },
    isTaxable: { type: Boolean, default: true },
    isStatutory: { type: Boolean, default: false },
    statutoryRule: { type: String, enum: ['PF_BASIC', 'ESI_GROSS', 'PT', 'GRATUITY'] }
  }]
}, {
  timestamps: true
});

const SalaryStructure: Model<ISalaryStructure> = mongoose.models.SalaryStructure || mongoose.model<ISalaryStructure>('SalaryStructure', SalaryStructureSchema);

export default SalaryStructure;
