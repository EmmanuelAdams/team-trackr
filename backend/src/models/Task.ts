import { Schema, model } from 'mongoose';
import { ProjectDocument } from './Project';
import { UserDocument } from './User';

export interface TaskDocument extends Document {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: UserDocument['_id'][];
  projectId: ProjectDocument['_id'];
  comments: string[];
  startDate: Date;
  endDate: Date;
}

const TaskSchema = new Schema<TaskDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  comments: [
    { type: Schema.Types.ObjectId, ref: 'Comment' },
  ],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export const Task = model<TaskDocument>('Task', TaskSchema);
