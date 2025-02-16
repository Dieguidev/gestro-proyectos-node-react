import mongoose, { Document, Schema, Types } from "mongoose";
import { NoteModel } from "./notes.model";

const taskStatus = {
  PENDING: 'pending',
  ON_HOLD: 'onHold',
  IN_PROGRESS: 'inProgress',
  UNDER_REVIEW: 'underReview',
  COMPLETED: 'completed',
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

export interface ITask extends Document {
  name: string;
  description: string;
  projectId: Types.ObjectId;
  status: TaskStatus;
  completedBy: {
    user: Types.ObjectId;
    status: TaskStatus;
  }[];
  notes: Types.ObjectId[];
}

const taskSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Task Name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  projectId: {
    type: Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  status: {
    type: String,
    enum: Object.values(taskStatus),
    default: taskStatus.PENDING
  },
  completedBy: [
    {
      user: {
        type: Types.ObjectId,
        ref: 'User',
        default: null
      },
      status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
      },
    }
  ],
  notes: [
    {
      type: Types.ObjectId,
      ref: 'Note',
      default: []
    }
  ]
}, {
  timestamps: true
})

taskSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const taskId = this._id;
  if (!taskId) return
  await NoteModel.deleteMany({ task: taskId });
});


export const TaskModel = mongoose.model<ITask>('Task', taskSchema, 'tasks');
