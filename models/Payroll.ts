import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  month: number; // 0-11
  year: number;
  
  // Snapshots for Audit
  salarySnapshot: {
    ctcAnnual: number;
    components: {
      label: string;
      amount: number;
      type: 'Earning' | 'Deduction' | 'Employer Contribution';
    }[];
  };
  
  attendanceSnapshot: {
    totalDays: number;
    workingDays: number;
    paidDays: number;
    presentDays: number;
    halfDays: number;
    leaveDays: number;
    holidayDays: number;
    lopDays: number;
  };

  // Final Values
  earnings: {
    label: string;
    amount: number;
    isArrear: boolean;
  }[];
  
  deductions: {
    label: string;
    amount: number;
    category: 'Statutory' | 'Tax' | 'Other';
  }[];

  totalEarnings: number;
  totalDeductions: number;
  netPayable: number;
  
  // Statutory Compliance
  statutory: {
    pfEmployee: number;
    pfEmployer: number;
    esiEmployee: number;
    esiEmployer: number;
    pt: number;
    tds: number;
  };

  // Adjustments & Extras
  adjustments: {
    label: string;
    amount: number;
    type: 'Bonus' | 'Deduction' | 'Arrear';
    note?: string;
  }[];

  // Payment Tracking
  paymentDetails?: {
    method: 'Bank Transfer' | 'Cash' | 'Cheque';
    transactionRef?: string;
    paidAt?: Date;
  };

  status: 'Draft' | 'Generated' | 'Approved' | 'Paid' | 'Closed';
  generatedAt: Date;
  generatedBy: string;
  approvedAt?: Date;
  approvedBy?: string;
  
  // Audit
  remarks?: string;
}

const PayrollSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  
  salarySnapshot: {
    ctcAnnual: { type: Number, required: true },
    components: [{
      label: { type: String, required: true },
      amount: { type: Number, required: true },
      type: { type: String, enum: ['Earning', 'Deduction', 'Employer Contribution'], required: true }
    }]
  },
  
  attendanceSnapshot: {
    totalDays: { type: Number, required: true },
    workingDays: { type: Number, required: true },
    paidDays: { type: Number, required: true },
    presentDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    holidayDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 }
  },

  earnings: [{
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    isArrear: { type: Boolean, default: false }
  }],
  
  deductions: [{
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: ['Statutory', 'Tax', 'Other'], required: true }
  }],

  totalEarnings: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  netPayable: { type: Number, required: true },
  
  statutory: {
    pfEmployee: { type: Number, default: 0 },
    pfEmployer: { type: Number, default: 0 },
    esiEmployee: { type: Number, default: 0 },
    esiEmployer: { type: Number, default: 0 },
    pt: { type: Number, default: 0 },
    tds: { type: Number, default: 0 }
  },

  adjustments: [{
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Bonus', 'Deduction', 'Arrear'], required: true },
    note: { type: String }
  }],

  paymentDetails: {
    method: { type: String, enum: ['Bank Transfer', 'Cash', 'Cheque'] },
    transactionRef: { type: String },
    paidAt: { type: Date }
  },

  status: { type: String, enum: ['Draft', 'Generated', 'Approved', 'Paid', 'Closed'], default: 'Generated' },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String, required: true },
  approvedAt: { type: Date },
  approvedBy: { type: String },
  remarks: { type: String }
}, {
  timestamps: true
});

PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Payroll: Model<IPayroll> = mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);

export default Payroll;
