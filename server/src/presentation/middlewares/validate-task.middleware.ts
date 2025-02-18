import { NextFunction, Request, Response } from 'express';
import { Validators } from '../../config';
import { prisma } from '../../data/prisma/prisma-db';

declare global {
  namespace Express {
    interface Request {
      task?: { projectId: string; id: string };
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
    try {
      const task = await prisma.task.findUnique({
        where: {
          id: taskId,
        },
        select: {
          projectId: true,
          id: true,
        },
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      req.task = task;
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async taskBelongsToProject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!req.task || !req.project) {
      return res.status(500).json({
        msg: 'Se quiere verificar la tarea sin validar el proyecto primero',
      });
    }
    const { task, project } = req;
    if (task.projectId !== project.id) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to access this task' });
    }
    next();
  }
}
