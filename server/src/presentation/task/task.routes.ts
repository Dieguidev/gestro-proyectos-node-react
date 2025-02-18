import { Router } from 'express';
import { ValidateProjectMiddleware } from '../middlewares/validate-project-exists.middleware';
import { TaskService } from '../services/task.service';
import { TaskController } from './task.controller';
import { ValidateTaskMiddleware } from '../middlewares/validate-task.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TaskServicePrisma } from '../services/task.service-prisma';

export class TaskRoutes {
  static get routes(): Router {
    const router = Router();

    const taskService = new TaskService();
    const taskservicePrisma = new TaskServicePrisma();
    const controller = new TaskController(taskService, taskservicePrisma);

    router.use(AuthMiddleware.validateJWT);

    router.param('projectId', ValidateProjectMiddleware.validateProjectExists);
    router.param('taskId', ValidateTaskMiddleware.validateTaskExists);

    router.post(
      '/:projectId',
      [ValidateProjectMiddleware.hasAuthorization],
      controller.createTask
    );
    router.get('/:projectId', controller.getTasksByProjectId);

    router.get(
      '/:taskId/project/:projectId',
      [ValidateTaskMiddleware.taskBelongsToProject],
      controller.getTaskById
    );
    router.put(
      '/:taskId/project/:projectId',
      [
        ValidateProjectMiddleware.hasAuthorization,
        ValidateTaskMiddleware.taskBelongsToProject,
      ],
      controller.updateTask
    );
    router.delete(
      '/:taskId/project/:projectId',
      [
        ValidateProjectMiddleware.hasAuthorization,
        ValidateTaskMiddleware.taskBelongsToProject,
      ],
      controller.deleteTask
    );
    router.post(
      '/:taskId/project/:projectId/status',
      [
        ValidateProjectMiddleware.hasAuthorization,
        ValidateTaskMiddleware.taskBelongsToProject,
      ],
      controller.updateTaskStatus
    );

    return router;
  }
}
