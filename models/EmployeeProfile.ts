
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployeeProfile extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User model (from better-auth)
  
  // Professional Details
  department: string;
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

  createdAt: Date;
  updatedAt: Date;
}

const EmployeeProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  department: { type: String, required: true },
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
  }]
}, {
  timestamps: true
});

// Check if model already exists to prevent overwrite error during hot reload
// In development, we want to delete it if it exists to ensure new schema changes are applied
if (process.env.NODE_ENV === 'development' && mongoose.models.EmployeeProfile) {
  delete mongoose.models.EmployeeProfile;
}

const EmployeeProfile: Model<IEmployeeProfile> = mongoose.models.EmployeeProfile || mongoose.model<IEmployeeProfile>('EmployeeProfile', EmployeeProfileSchema);

export default EmployeeProfile;
