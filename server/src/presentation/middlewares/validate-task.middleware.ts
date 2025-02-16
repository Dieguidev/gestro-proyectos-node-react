import { NextFunction, Request, Response } from "express";
import { ITask, TaskModel } from "../../data/mongodb/models/task.model";
import { Validators } from "../../config";
import { CustomError } from "../../domain";

declare global {
  namespace Express {
    interface Request {
      task?: ITask;
    }
  }
}

export class ValidateTaskMiddleware {

  static async validateTaskExists(req: Request, res: Response, next: NextFunction) {
    const { taskId } = req.params;
    if (!Validators.isMongoID(taskId)) {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    const task = await TaskModel.findById(taskId);
    if
      (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    req.task = task;
    next();
  }

  static async taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    const { task, project } = req;
    if (task!.projectId.toString() !== project!.id.toString()) {
      return res.status(403).json({ error: 'You are not allowed to access this task' });
    }
    next();
  }

  static async hasAuthorization(req: Request, res: Response, next: NextFunction) {
      const { project, user } = req;
      if (user!.id.toString() !== project!.manager.toString()) {
        return res.status(403).json({ error: 'Acción no válida' });
      }
      next();

  }
}
