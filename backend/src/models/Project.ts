import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

export interface ProjectDocument extends Document {
  name: string;
  description: string;
  assignedTo: UserDocument['_id'];
  // user: UserDocument['_id'];
  startDate: Date;
  // task: TaskDocument['_id'];
  endDate: Date;
}

const projectSchema = new Schema<ProjectDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  },
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export const Project = model<ProjectDocument>(
  'Project',
  projectSchema
);


projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});