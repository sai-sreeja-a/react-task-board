
import mongoose, { Schema, Document } from "mongoose";

export interface TaskDocument extends Document {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const TaskModel = mongoose.model<TaskDocument>(
  "Task",
  taskSchema
);

export default TaskModel;
