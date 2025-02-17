import { Request, Response } from 'express';
import {
  ConfirmTokenDto,
  CustomError,
  ForgotPasswordDto,
  GetAndDeleteUserDto,
  LoginUserDto,
  RegisterUserDto,
  RequestConfirmationCodeDto,
  UpdatePasswordDto,
} from '../../domain';

import { AuthService } from '../services/auth.service';
import { AuthServicePrisma } from '../services/auth.service-prisma';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authServicePrisma: AuthServicePrisma
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);

    return res.status(500).json({ error: 'Internal Server Error' });
  };

  registerUser = (req: Request, res: Response) => {
    const [error, registerUserDto] = RegisterUserDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.authServicePrisma
      .registerUser(registerUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  loginUser = (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.authServicePrisma
      .loginUser(loginUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  deleteUser = (req: Request, res: Response) => {
    const { id } = req.params;
    const [error, getAndDeleteUserDto] = GetAndDeleteUserDto.create({ id });
    if (error) return res.status(400).json({ error });

    this.authService
      .delete(getAndDeleteUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  confirmAccount = (req: Request, res: Response) => {
    const [error, confirmTokenDto] = ConfirmTokenDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.authServicePrisma
      .confirmSixDigitToken(confirmTokenDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  requestConfirmationCode = (req: Request, res: Response) => {
    const [error, requestConfirmationCodeDto] =
      RequestConfirmationCodeDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.authServicePrisma
      .requestConfirmationCode(requestConfirmationCodeDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  forgotPassword = (req: Request, res: Response) => {
    const [error, forgotPasswordDto] = ForgotPasswordDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.authServicePrisma
      .forgotPassword(forgotPasswordDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  validateTokenToResetPassword = (req: Request, res: Response) => {
    const [error, confirmTokenDto] = ConfirmTokenDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.authServicePrisma
      .validateTokenToResetPassword(confirmTokenDto!)
      .then((rpta) => res.json(rpta))
      .catch((error) => this.handleError(error, res));
  };

  updatePassword = (req: Request, res: Response) => {
    const { token } = req.params;
    const [error, updatePasswordDto] = UpdatePasswordDto.create({
      ...req.body,
      token,
    });
    if (error) return res.status(400).json({ error });

    this.authServicePrisma
      .updatePasswordWithToken(updatePasswordDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  // getUsers = (req: Request, res: Response) => {
  //   UserModel.find()
  //     .then(users => res.json({
  //       user: req.body.user
  //     }))
  //     .catch(error => this.handleError(error, res))
  // }
}
