import { Document } from 'mongoose';
import { UserDocument } from './user.model';

export interface ProjectDocument extends Document {
  name: string;
  description: string;
  assignedTo: UserDocument['_id'];
  startDate: Date;
  endDate: Date;
}
