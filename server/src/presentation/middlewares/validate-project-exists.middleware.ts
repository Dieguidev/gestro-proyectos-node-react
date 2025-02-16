import { NextFunction, Request, Response } from "express";
import { IProject, ProjectModel } from "../../data/mongodb";
import { Validators } from "../../config";

declare global {
  namespace Express {
    interface Request {
      project?: any;
    }
  }
}

export class ValidateProjectMiddleware {

  static async validateProjectExists(req: Request, res: Response, next: NextFunction) {
    const { projectId } = req.params;
    if (!Validators.isMongoID(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    req.project = project;
    next();
  }
}
