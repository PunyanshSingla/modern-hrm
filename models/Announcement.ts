import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  author: string; // User ID or display name
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  author: { type: String, required: true }
}, {
  timestamps: true
});

const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
