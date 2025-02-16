import { Router } from "express";
import { ValidateProjectMiddleware } from "../middlewares/validate-project-exists.middleware";
import { TaskService } from "../services/task.service";
import { TaskController } from "./task.controller";
import { ValidateTaskMiddleware } from "../middlewares/validate-task.middleware";
import { AuthMiddleware } from "../middlewares/auth.middleware";



export class TaskRoutes {
  static get routes(): Router {
    const router = Router();

    const taskService = new TaskService();
    const controller = new TaskController(taskService);
    router.use(AuthMiddleware.validateJWT)

    router.param('projectId', ValidateProjectMiddleware.validateProjectExists);

    router.post('/:projectId', [ValidateTaskMiddleware.hasAuthorization], controller.createTask);
    router.get('/:projectId', controller.getTasksByProjectId);

    router.param('taskId', ValidateTaskMiddleware.validateTaskExists);
    router.param('taskId', ValidateTaskMiddleware.taskBelongsToProject);

    router.get('/:projectId/task/:taskId', controller.getTaskById);
    router.put('/:projectId/task/:taskId', [ValidateTaskMiddleware.hasAuthorization], controller.updateTask);
    router.delete('/:projectId/task/:taskId', [ValidateTaskMiddleware.hasAuthorization], controller.deleteTask);
    router.post('/:projectId/task/:taskId/status', controller.updateTaskStatus);


    return router;
  }
}
