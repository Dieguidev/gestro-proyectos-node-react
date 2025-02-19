import { Router } from 'express';
import { ProjectController } from './project.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ValidateProjectMiddleware } from '../middlewares/validate-project-exists.middleware';
import { ProjectServicePrisma } from '../services/project.service-prisma';

export class ProjectRoutes {
  static get routes(): Router {
    const router = Router();

    const projectServicePrisma = new ProjectServicePrisma();
    const controller = new ProjectController(projectServicePrisma);

    router.use(AuthMiddleware.validateJWT);
    router.param('projectId', ValidateProjectMiddleware.validateProjectExists);

    router.post('/', controller.createProject);
    router.get('/', controller.getAllProjects);
    router.get('/:projectId', controller.getProjectById);
    router.put(
      '/:projectId',
      [ValidateProjectMiddleware.hasAuthorization],
      controller.updateProject
    );
    router.delete(
      '/:projectId',
      [ValidateProjectMiddleware.hasAuthorization],
      controller.deleteProject
    );

    //*router for team members
    router.get('/:projectId/team/find', controller.findMemberByEmail);
    router.post('/:projectId/team', controller.addMemberById);
    router.delete('/:projectId/team/:userId', controller.removeMemberById);
    router.get('/:projectId/team', controller.getMembers);

    return router;
  }
}
