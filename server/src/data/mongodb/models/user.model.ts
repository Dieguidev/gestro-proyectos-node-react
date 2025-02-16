import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document{
  email: string;
  password: string;
  name: string;
  confirmed: boolean;
}


const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  name: {
    type: String,
    required: [true, 'Password is required']
  },
  confirmed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  }
});


export const UserModel = mongoose.model<IUser>('User', userSchema, 'users');
