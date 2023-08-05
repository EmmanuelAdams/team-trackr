import { model, Schema } from 'mongoose';
import { UserDocument } from '../models/user.model';

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  level: {
    type: String,
    enum: ['Junior', 'Mid-level', 'Senior', 'CEO'],
    required: true,
  },
  yearsOfWork: { type: Number, required: true },
  availability: {
    status: {
      type: String,
      enum: ['Available', 'Not Available'],
      required: true,
    },
    reason: { type: String },
    nextAvailability: { type: Date },
  },
});

export const User = model<UserDocument>('User', userSchema);
