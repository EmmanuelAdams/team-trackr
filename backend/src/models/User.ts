import { model, Schema, Document } from 'mongoose';
import crypto from 'crypto';

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
  userType: 'Employee' | 'Organization';
  organizationName?: string;
  employees?: string[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  getResetPasswordToken: () => string;
  createdAt: Date;
}

const UserSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
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
  yearsOfWork: {
    type: Number,
    required: true,
    min: 0,
    max: 99,
  },
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
  },
  userType: {
    type: String,
    enum: ['Employee', 'Organization'],
    required: true,
  },
  organizationName: {
    type: String,
    required: function (this: UserDocument) {
      return this.userType === 'Organization';
    },
  },
  employees: {
    type: [String],
    required: function (this: UserDocument) {
      return this.userType === 'Organization';
    },
    default: [],
  },
  resetPasswordToken: {
    type: String,
    default: '',
  },
  resetPasswordExpire: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration
  this.resetPasswordExpire =
    Date.now() + 24 * 60 * 60 * 1000;

  return resetToken;
};

export const User = model<UserDocument>('User', UserSchema);
