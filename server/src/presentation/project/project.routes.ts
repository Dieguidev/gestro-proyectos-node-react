import { Router } from "express";
import { ProjectService } from "../services/project.service";
import { ProjectController } from "./project.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ValidateProjectMiddleware } from "../middlewares/validate-project-exists.middleware";
import { ValidateTaskMiddleware } from "../middlewares/validate-task.middleware";




export class ProjectRoutes {

  static get routes(): Router {
    const router = Router();

    const projectService = new ProjectService()
    const controller = new ProjectController(projectService);

    router.use(AuthMiddleware.validateJWT)
    router.param('projectId', ValidateProjectMiddleware.validateProjectExists);

    router.post('/', controller.createProject)
    router.get('/', controller.getAllProjects)
    router.get('/:id', controller.getProjectById)
    router.put('/:projectId', [ValidateTaskMiddleware.hasAuthorization], controller.updateProject)
    router.delete('/:projectId', [ValidateTaskMiddleware.hasAuthorization], controller.deleteProject)


    //*router for team members
    router.post('/:projectId/team/find', controller.findMemberByEmail)
    router.post('/:projectId/team', controller.addMemberById)
    router.delete('/:projectId/team/:userId', controller.removeMemberById)
    router.get('/:projectId/team', controller.getMembers)

    return router;
  }
}
