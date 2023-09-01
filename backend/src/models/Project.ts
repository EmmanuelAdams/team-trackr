import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface ProjectDocument extends Document {
  name: string;
  description: string;
  dueDate: Date;
  status: 'New' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  createdBy: UserDocument['_id'];
  startDate: Date;
  endDate: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true, min: 3, max: 50 },
    description: {
      type: String,
      required: true,
      min: 3,
      max: 300,
    },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['New', 'InProgress', 'Done'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false,
});

export const Project = model<ProjectDocument>(
  'Project',
  projectSchema
);
