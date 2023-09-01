import { Document, Schema, model } from 'mongoose';
import { TaskDocument } from './Task';
import { UserDocument } from './User';

export interface ProjectDocument extends Document {
  name: string;
  description: string;
  createdBy: UserDocument['_id'];
  startDate: Date;
  endDate: Date;
}

const projectSchema = new Schema<ProjectDocument>({
  name: { type: String, required: true, min: 3, max: 50 },
  description: {
    type: String,
    required: true,
    min: 3,
    max: 300,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date},
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
 }
);



 projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});


export const Project = model<ProjectDocument>(
  'Project',
  projectSchema
);
