import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { ProjectDocument } from './Project';

export interface TaskDocument extends Document {
  title: string;
  description: string;
  dueDate: Date;
  status: 'New' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  createdBy: UserDocument['_id'];
  assignedTo: UserDocument['_id'][];
  project: ProjectDocument['_id'];
  // comments: string[];
  startDate: Date;
  endDate: Date;
}

const taskSchema = new Schema<TaskDocument>({
  title: { type: String, required: true, min: 3, max: 50 },
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
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  // comments: [
  //   { type: Schema.Types.ObjectId, ref: 'Comment' },
  // ],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
}, 
{
toJSON: { virtuals: true },
toObject: { virtuals: true }
}
);


taskSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'task',
  justOne: false,
});

export const Task = model<TaskDocument>('Task', taskSchema);
