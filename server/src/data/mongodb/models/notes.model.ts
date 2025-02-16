import mongoose, { Schema, Types } from "mongoose";

export interface INote extends Document {
  content: string;
  createdBy: Types.ObjectId;
  task: Types.ObjectId;
}

const noteSchema: Schema = new Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  task: {
    type: Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  }
}, {
  timestamps: true
});

export const NoteModel = mongoose.model<INote>('Note', noteSchema, 'notes');
