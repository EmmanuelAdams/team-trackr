import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

export interface ProjectDocument extends Document {
  name: string;
  description: string;
  assignedTo: UserDocument['_id'];
  startDate: Date;
  tasks: TaskDocument['_id'];
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
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }], // Reference to tasks using ObjectId
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export const Project = model<ProjectDocument>(
  'Project',
  projectSchema
);
