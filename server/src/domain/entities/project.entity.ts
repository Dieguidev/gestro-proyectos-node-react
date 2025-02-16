import mongoose from "mongoose";
import { ITask } from "../../data/mongodb/models/task.model";
import { CustomError } from "../errors/custom.error";
import { TaskEntity } from "./task.entity";

export class ProjectEntity {
  constructor(
    public id: string,
    public projectName: string,
    public clientName: string,
    public description: string,
    public tasks: (TaskEntity | mongoose.Types.ObjectId)[] = [],
    public manager: mongoose.Types.ObjectId,
    public team: mongoose.Types.ObjectId[] = [],
  ) { }

  static fromJson(object: { [key: string]: any }): ProjectEntity {
    const {
      id, _id,
      projectName,
      clientName,
      description,
      tasks = [],
      manager,
      team
       } = object;

    if (!id && !_id) throw CustomError.badRequest('Missing ID');
    if (!projectName) throw CustomError.badRequest('Missing projectName');
    if (!clientName) throw CustomError.badRequest('Missing clientName');
    if (!description) throw CustomError.badRequest('Missing description');
    if (!manager) throw CustomError.badRequest('Missing manager');
    if (!team) throw CustomError.badRequest('Missing team');

    const processedTasks = Array.isArray(tasks) && tasks.length > 0
      ? tasks.map((task: any) => {
        if (task && typeof task === 'object' && 'name' in task && 'description' in task && 'projectId' in task && 'status' in task) {
          return TaskEntity.fromJson(task);
        }

        return task;
      })
      : [];

    return new ProjectEntity(
      id || _id,
      projectName,
      clientName,
      description,
      processedTasks,
      manager,
      team
    );
  }
}



