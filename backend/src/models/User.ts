import mongoose, {
  model,
  Schema,
  Document,
} from 'mongoose';
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
  phoneNumber?: string;
  role: string;
  department: string;
  dateOfJoining: Date;
  level: 'Junior' | 'Mid-level' | 'Senior' | 'CEO';
  status: 'pending' | 'approved' | 'rejected';
  yearsOfWork?: number;
  availability?: Availability;
  userType: 'Employee';
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  organization: mongoose.Schema.Types.ObjectId;
  getResetPasswordToken: () => string;
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
  phoneNumber: {
    type: String,
    validate: {
      validator: (value: string) =>
        /^\+?[0-9]{7,15}$/.test(value),
      message: 'Invalid phone number format',
    },
  },
  role: { type: String, required: true },
  department: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  level: {
    type: String,
    enum: ['Junior', 'Mid-level', 'Senior', 'CEO'],
    required: true,
  },
  yearsOfWork: {
    type: Number,
    min: 0,
    max: 99,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  availability: {
    status: {
      type: String,
      enum: ['Available', 'Not Available'],
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
  userType: {
    type: String,
    enum: ['Employee'],
    required: true,
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

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire =
    Date.now() + 24 * 60 * 60 * 1000;
  return resetToken;
};

export const User = model<UserDocument>('User', UserSchema);
