import { NextFunction, Request, Response } from 'express';
import { Validators } from '../../config';
import { prisma } from '../../data/prisma/prisma-db';
import { Task } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      task?: Task;
    }
  }
}

export class ValidateTaskMiddleware {
  static async validateTaskExists(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { taskId } = req.params;

    if (!Validators.isUUID(taskId)) {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    req.task = task;
    next();
  }

  static async taskBelongsToProject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { task, project } = req;
    console.log('task', task);
    console.log('project', project);

    if (task!.projectId !== project!.id) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to access this task' });
    }
    next();
  }
}
