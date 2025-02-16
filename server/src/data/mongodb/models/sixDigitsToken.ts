import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISixDigitsToken extends Document {
  token: string;
  user: Types.ObjectId;
  createdAt: Date;
}

const sixDigitsTokenSchema : Schema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now(),
    expires: "10m",
  }
});

export const SixDigitsTokenModel = mongoose.model<ISixDigitsToken>('SixDigitsToken', sixDigitsTokenSchema, 'sixDigitsTokens');
