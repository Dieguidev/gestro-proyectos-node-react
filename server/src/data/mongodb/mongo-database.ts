import mongoose from "mongoose"
import colors from "colors"

interface Options {
  mongoUrl: string;
  dbName: string;
}

export class MongoDatabase {
  static async connect(options: Options) {
    const { dbName, mongoUrl } = options;
    try {
      const { connection } = await mongoose.connect(mongoUrl, {
        dbName: dbName
      })
      const url = `${connection.host}:${connection.port}/${connection.name}`
      console.log(colors.magenta.bold(`Mongo connected on ${url}`))
    } catch (error) {

      console.log(colors.red.bold("Mongo connection error"))
      throw error;
    }
  }
}

