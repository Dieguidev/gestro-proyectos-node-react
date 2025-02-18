import { NextFunction, Request, Response } from 'express';
import { Validators } from '../../config';
import { prisma } from '../../data/prisma/prisma-db';

declare global {
  namespace Express {
    interface Request {
      project?: { id: string; managerId: string };
    }
  }
}

export class ValidateProjectMiddleware {
  static async validateProjectExists(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { projectId } = req.params;

    if (!Validators.isUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    try {
      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
        },
        select: {
          id: true,
          managerId: true,
        },
      });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      req.project = project;
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async hasAuthorization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!req.userPrisma) {
      return res.status(500).json({
        msg: 'Se quiere verificar la autorización sin validar el token primero',
      });
    }
    if (!req.project) {
      return res.status(500).json({
        msg: 'Se quiere verificar la autorización sin validar el proyecto primero',
      });
    }
    const { project, userPrisma } = req;
    if (userPrisma!.id !== project!.managerId) {
      return res.status(403).json({ error: 'Acción no válida' });
    }
    next();
  }
}
