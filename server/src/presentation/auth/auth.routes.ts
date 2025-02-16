



import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { EmailService } from "../services/email.service";
import { envs } from "../../config";
import { AuthService } from "../services/auth.service";



export class AuthRoutes {


  static get routes(): Router {
    const router = Router();

    const emailService = new EmailService(
      // envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL,
    );

    const authService = new AuthService(emailService);

    const controller = new AuthController(authService);

    router.post('/login', controller.loginUser)
    router.post('/register', controller.registerUser)
    router.delete('/:id', [AuthMiddleware.isAdminRoleOrSameUser], controller.deleteUser)
    router.post('/confirm-account', controller.confirmAccount)
    router.post('/request-confirmation-code', controller.requestConfirmationCode)
    router.post('/forgot-password', controller.forgotPassword)
    router.post('/validate-token', controller.validateTokenFromResetPassword)
    router.put('/update-password/:token', controller.updatePassword)
    router.get('/user', [AuthMiddleware.validateJWT], controller.user)


    router.put('/profile', [AuthMiddleware.validateJWT], controller.updateUser)
    router.post('/update-password', [AuthMiddleware.validateJWT], controller.updateCurrentUserPassword)
    router.post('/check-password', [AuthMiddleware.validateJWT], controller.checkPassword)

    // router.get('/', [AuthMiddleware.validateJWT], controller.getUsers)


    return router;
  }
}
