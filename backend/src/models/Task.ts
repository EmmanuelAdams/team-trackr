import { Document, Schema, model } from "mongoose";
import { UserDocument } from "./User";
import { ProjectDocument } from "./Project";

// Define an interface for the Task
export interface TaskDocument extends Document {
  title: string;
  description: string;
  dueDate: Date;
  status: "Todo" | "InProgress" | "Done"; 
  priority: "Low" | "Medium" | "High";
  assignedTo: UserDocument["_id"][]; // User ID of the assigned user
  project: ProjectDocument["_id"]; // Project ID to which the task belongs
  comments: string[]; // Array of Comment IDs
  startDate: Date;
  endDate: Date;
}

// Define the Task schema
const TaskSchema = new Schema<TaskDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Todo", "InProgress", "Done"],
    default: "Todo",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export const Task = model<TaskDocument>("Task", TaskSchema);
