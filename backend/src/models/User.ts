import { model, Schema, Document } from 'mongoose';

interface Availability {
  status: 'Available' | 'Not Available';
  reason?: string;
  nextAvailability?: Date;
}

export interface UserDocument extends Document {
  name: string;
  password: string;
  email: string;
  level: 'Junior' | 'Mid-level' | 'Senior' | 'CEO';
  yearsOfWork: number;
  availability: Availability;
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value: string) =>
        /\S+@\S+\.\S+/.test(value),
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
    type: {
      status: {
        type: String,
        enum: ['Available', 'Not Available'],
        required: true,
      },
      reason: {
        type: String,
        required: function (this: UserDocument) {
          return (
            this.availability?.status === 'Not Available'
          );
        },
      },
      nextAvailability: {
        type: Date,
        required: function (this: UserDocument) {
          return (
            this.availability?.status === 'Not Available'
          );
        },
      },
    },
    required: true,
  },
});

export const User = model<UserDocument>('User', userSchema);
