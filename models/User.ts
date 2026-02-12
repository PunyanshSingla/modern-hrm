import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  // Add other fields as needed
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  image: { type: String },
  role: { type: String, default: 'user' },
}, {
  timestamps: true,
  collection: 'user' // Explicitly map to 'user' collection created by better-auth
});

// Check if model already exists to prevent overwrite error during hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
