import mongoose from "mongoose";
import { validate as uuidValidate } from 'uuid';

export class Validators {


  static get email() {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  }

  static isMongoID(id: string) {
    return mongoose.isValidObjectId(id);
  }

  static isUUID(uuid: string) {
    return uuidValidate(uuid);
  }
}
