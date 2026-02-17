import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITaxDeclaration extends Document {
  employeeId: mongoose.Types.ObjectId;
  financialYear: string; // e.g., "2023-24"
  regime: 'Old' | 'New';
  
  // Section 80C
  section80C: {
    amount: number;
    proofUrl?: string;
    status: 'Pending' | 'Verified' | 'Rejected';
  }[];
  
  // Other Sections (80D, 80G, etc.)
  otherSections: {
    section: string;
    label: string;
    amount: number;
    proofUrl?: string;
    status: 'Pending' | 'Verified' | 'Rejected';
  }[];
  
  // HRA
  hra: {
    rentPaid: number;
    landlordName?: string;
    landlordPan?: string;
    landlordAddress?: string;
    isMetro: boolean;
    proofUrl?: string;
    status: 'Pending' | 'Verified' | 'Rejected';
  };

  previousEmployment: {
    income: number;
    tds: number;
  };

  finalTaxPayable?: number;
  isLocked: boolean;
}

const TaxDeclarationSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  financialYear: { type: String, required: true },
  regime: { type: String, enum: ['Old', 'New'], default: 'New' },
  
  section80C: [{
    amount: { type: Number, default: 0 },
    proofUrl: { type: String },
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
  }],
  
  otherSections: [{
    section: { type: String, required: true },
    label: { type: String, required: true },
    amount: { type: Number, default: 0 },
    proofUrl: { type: String },
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
  }],
  
  hra: {
    rentPaid: { type: Number, default: 0 },
    landlordName: { type: String },
    landlordPan: { type: String },
    landlordAddress: { type: String },
    isMetro: { type: Boolean, default: false },
    proofUrl: { type: String },
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
  },

  previousEmployment: {
    income: { type: Number, default: 0 },
    tds: { type: Number, default: 0 }
  },

  finalTaxPayable: { type: Number },
  isLocked: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Unique declaration per employee per financial year
TaxDeclarationSchema.index({ employeeId: 1, financialYear: 1 }, { unique: true });

const TaxDeclaration: Model<ITaxDeclaration> = mongoose.models.TaxDeclaration || mongoose.model<ITaxDeclaration>('TaxDeclaration', TaxDeclarationSchema);

export default TaxDeclaration;
