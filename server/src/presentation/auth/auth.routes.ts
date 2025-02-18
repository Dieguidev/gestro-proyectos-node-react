import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { EmailService } from '../services/email.service';
import { envs } from '../../config';
import { AuthService } from '../services/auth.service';
import { AuthServicePrisma } from '../services/auth.service-prisma';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL
    );

    const authServicePrisma = new AuthServicePrisma(emailService);

    const controller = new AuthController(authServicePrisma);

    router.post('/login', controller.loginUser);
    router.post('/register', controller.registerUser);
    //TODO: Trasladar esta ruta u servicio a un controlador de usuarios
    // router.delete(
    //   '/:id',
    //   [AuthMiddleware.isAdminRoleOrSameUser],
    //   controller.deleteUser
    // );
    router.post('/confirm-account', controller.confirmAccount);
    router.post(
      '/request-confirmation-code',
      controller.requestConfirmationCode
    );
    router.post('/forgot-password', controller.forgotPassword);
    router.post('/validate-token', controller.validateTokenToResetPassword);
    router.put('/update-password/:token', controller.updatePassword);

    // router.get('/', [AuthMiddleware.validateJWT], controller.getUsers)

    return router;
  }
}
