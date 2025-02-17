import { Router } from 'express';
import { UserServicePrisma } from '../services/user.service-prisma';
import { UserController } from './user.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
export class UserRoutes {
  static get routes(): Router {
    const router = Router();
    const userServicePrisma = new UserServicePrisma();
    const controller = new UserController(userServicePrisma);

    router.put('/profile', [AuthMiddleware.validateJWT], controller.updateUser);
    router.get('/', [AuthMiddleware.validateJWT], controller.user);
    router.put(
      '/update-password',
      [AuthMiddleware.validateJWT],
      controller.updateCurrentUserPassword
    );

    return router;
  }
}
