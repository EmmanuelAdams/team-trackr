import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

export interface CommentDocument extends Document {
  text: string;
  createdAt: Date;
  task: TaskDocument['_id'];
  createdBy: UserDocument['_id'];
}

const commentSchema = new Schema<CommentDocument>({
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const Comment = model<CommentDocument>(
  'Comment',
  commentSchema
);
