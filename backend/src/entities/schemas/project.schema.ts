import { Schema, model } from 'mongoose';
import { ProjectDocument } from '../models/project.model';

const projectSchema = new Schema<ProjectDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export const Project = model<ProjectDocument>(
  'Project',
  projectSchema
);
