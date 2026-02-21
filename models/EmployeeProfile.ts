
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployeeProfile extends Document {
  userId: string; // Reference to the User model (from better-auth)
  
  // Professional Details
  departmentId?: mongoose.Types.ObjectId;
  department?: string;
  position: string;
  
  // Status
  status: 'invited' | 'onboarding' | 'verified' | 'rejected' | 'disabled';
  
  // Personal Details
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  
  // Onboarding Data
  documents: {
    name: string;
    url: string;
    type: string; // 'file' or 'link'
    documentType?: string; // Resume, ID Proof, etc.
    issuedBy?: string;
    issueDate?: Date;
  }[];
  
  experience: {
    company: string;
    role: string;
    employmentType?: string; // Full-time, Part-time, Contract, etc.
    startDate: Date;
    endDate?: Date;
    reasonForLeaving?: string;
    technologies?: string[]; // Array of technology names
    description?: string;
  }[];
  
  education: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: Date;
    endDate?: Date;
    graduationYear?: string;
  }[];
  
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  
  skills: string[];
  certifications: {
    name: string;
    issuer: string;
    date: Date;
    url?: string;
  }[];

  // Leave Management
  leaveBalances: {
      leaveTypeId: mongoose.Types.ObjectId | string; // Populated or ID
      balance: number;
  }[];

  baseSalary: number;
  salaryStructureId?: mongoose.Types.ObjectId;



  createdAt: Date;
  updatedAt: Date;
}

const EmployeeProfileSchema: Schema = new Schema({
  userId: { type: String, ref: 'User', required: true, unique: true },
  
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  department: { type: String }, // Keeping this for backward compatibility or display purposes, but making it optional
  position: { type: String, required: true },
  
  status: { type: String, enum: ['invited', 'onboarding', 'verified', 'rejected', 'disabled'], default: 'invited' },
  
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  address: { type: String },
  
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }, // 'file' or 'link'
    documentType: { type: String }, // Resume, ID Proof, etc.
    issuedBy: { type: String },
    issueDate: { type: Date }
  }],
  
  experience: [{
    company: { type: String },
    role: { type: String },
    employmentType: { type: String }, // Full-time, Part-time, Contract, etc.
    startDate: { type: Date },
    endDate: { type: Date },
    reasonForLeaving: { type: String },
    technologies: { type: [String], default: [] }, // Array of technology names
    description: { type: String }
  }],
  
  education: [{
    institution: { type: String },
    degree: { type: String },
    fieldOfStudy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    graduationYear: { type: String }
  }],
  
  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    ifscCode: { type: String }
  },
  
  skills: { type: [String], default: [] },
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    date: { type: Date },
    url: { type: String }
  }],

  leaveBalances: [{
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType' },
    balance: { type: Number, default: 0 }
  }],

  baseSalary: { type: Number, default: 0 },
  salaryStructureId: { type: Schema.Types.ObjectId, ref: 'SalaryStructure' }
});

export { EmployeeProfileSchema };

const EmployeeProfile: Model<IEmployeeProfile> = mongoose.models.EmployeeProfile || mongoose.model<IEmployeeProfile>('EmployeeProfile', EmployeeProfileSchema);

export default EmployeeProfile;
