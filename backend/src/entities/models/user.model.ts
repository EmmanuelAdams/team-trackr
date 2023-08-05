import { Document } from 'mongoose';

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
