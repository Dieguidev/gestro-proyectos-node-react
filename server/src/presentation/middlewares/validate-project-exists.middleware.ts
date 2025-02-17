import { NextFunction, Request, Response } from "express";
import { IProject, ProjectModel } from "../../data/mongodb";
import { Validators } from "../../config";
import { Project } from "@prisma/client";
import { prisma } from "../../data/prisma/prisma-db";

declare global {
  namespace Express {
    interface Request {
      project?: Project;
    }
  }
}

export class ValidateProjectMiddleware {

  static async validateProjectExists(req: Request, res: Response, next: NextFunction) {
    const { projectId } = req.params;
    if (!Validators.isUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    req.project = project;
    next();
  }
}
