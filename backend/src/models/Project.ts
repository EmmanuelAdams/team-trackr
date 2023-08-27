import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

export interface ProjectDocument extends Document {
  name: string;
  description: string;
  user: UserDocument['_id'];
  startDate: Date;
  // task: TaskDocument['_id'];
  endDate: Date;
}

const projectSchema = new Schema<ProjectDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
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


