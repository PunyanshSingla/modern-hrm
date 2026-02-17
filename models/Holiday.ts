import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: Date;
  type: 'Public' | 'Company' | 'Optional';
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema: Schema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['Public', 'Company', 'Optional'], 
    default: 'Public' 
  }
}, {
  timestamps: true
});

const Holiday: Model<IHoliday> = mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', HolidaySchema);

export default Holiday;
