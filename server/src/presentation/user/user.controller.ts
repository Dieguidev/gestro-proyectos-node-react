import { Request, Response } from 'express';
import { UserServicePrisma } from '../services/user.service-prisma';
import {
  CheckPasswordDto,
  CustomError,
  UpdateCurrentUserPasswordDto,
  UpdateUserDto,
} from '../../domain';
import { AuthServicePrisma } from '../services/auth.service-prisma';

export class UserController {
  constructor(private readonly userServicePrisma: UserServicePrisma) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);

    return res.status(500).json({ error: 'Internal Server Error' });
  };

  updateUser = (req: Request, res: Response) => {
    const [error, updateUserDto] = UpdateUserDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.userServicePrisma
      .update(updateUserDto!, req.userPrisma!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  user = (req: Request, res: Response) => {
    this.userServicePrisma
      .user(req.userPrisma!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  updateCurrentUserPassword = (req: Request, res: Response) => {
    const [error, updateCurrentUserPasswordDto] =
      UpdateCurrentUserPasswordDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.userServicePrisma
      .updateCurrentUserPassword(updateCurrentUserPasswordDto!, req.userPrisma!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  checkPassword = (req: Request, res: Response) => {
    const [error, checkPasswordDto] = CheckPasswordDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.userServicePrisma
      .checkPassword(checkPasswordDto!, req.userPrisma!)
      .then((rpta) => res.json(rpta))
      .catch((error) => this.handleError(error, res));
  };
}
