import { model, Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  password: string;
  email: string;
  level: 'Junior' | 'Mid-level' | 'Senior' | 'CEO';
  yearsOfWork: number;
  availability: {
    status: 'Available' | 'Not Available';
    reason?: string;
    nextAvailability?: Date;
  };
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    minlength: 3, // Minimum length for the name (adjust as needed)
    maxlength: 20, // Maximum length for the name (adjust as needed)
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length for the password (adjust as needed)
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value: string) =>
        /\S+@\S+\.\S+/.test(value), // Validate email format
      message: 'Invalid email format',
    },
  },
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
