
import { BcryptAdapter, envs, JwtAdapter } from '../../config';

import { UserModel } from '../../data/mongodb/models/user.model';

import {

  ConfirmTokenDto,
  CustomError,
  generateSixDigitToken,
  GetAndDeleteUserDto,
  IEmail,
  LoginUserDto,
  RegisterUserDto,
  RequestConfirmationCodeDto,

  UpdatePasswordDto,
} from '../../domain';
import { EmailService } from './email.service';
import { prisma } from '../../data/prisma/prisma-db';
import { UserResponseDto } from '../../domain/dtos/auth/response-user.dto';
import { LoginResponseDto } from '../../domain/dtos/auth/response-login.dto';

type HashFunction = (password: string) => string;
type ConpareFunction = (password: string, hashed: string) => boolean;

export class AuthServicePrisma {
  constructor(
    //DI - Servicio Email
    private readonly emailservice: EmailService,
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: ConpareFunction = BcryptAdapter.compare
  ) {}

  async registerUser(
    registerUserDto: RegisterUserDto
  ): Promise<UserResponseDto> {
    const { password, email, name } = registerUserDto;

    try {
      return await prisma.$transaction(async (prisma) => {
        const existUser = await prisma.user.findUnique({
          where: {
            email,
          },
          select: { id: true },
        });

        if (existUser) {
          throw CustomError.badRequest('User already exist');
        }

        const sixDigitsToken = generateSixDigitToken();
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: this.hashPassword(password),
            VerificationToken: {
              create: {
                token: sixDigitsToken,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
              },
            },
          },
        });
        console.log(user);

        try {
          await this.sendEmailValidationSixdigitToken({
            email: user.email,
            name: user.name,
            token: sixDigitsToken,
          }).catch((error) => {
            console.error('Email sending failed:', error);
          });
        } catch (error) {
          throw new Error('Failed to complete registration process');
        }

        return UserResponseDto.create(user);
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { VerificationToken: true },
      });
      if (!user) {
        throw CustomError.badRequest('Invalid credentials');
      }

      const isMatchPassword = this.comparePassword(password, user.password);
      if (!isMatchPassword) {
        throw CustomError.badRequest('Invalid credentials');
      }
      if (!user.confirmed) {
        await prisma.$transaction(async (prisma) => {
          const sixDigitsToken = generateSixDigitToken();
          await prisma.verificationToken.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              token: sixDigitsToken,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
            update: {
              token: sixDigitsToken,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
          });

          await this.sendEmailValidationSixdigitToken({
            email: user.email,
            name: user.name,
            token: sixDigitsToken,
          });
        });
        throw CustomError.badRequest(
          'Unconfirmed email, email with token is sent'
        );
      }
      const token = await this.generateJWTTokenService(user.id);

      return LoginResponseDto.create(user, token);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    }
  }

  async delete(getAndDeleteUserDto: GetAndDeleteUserDto) {
    const { id } = getAndDeleteUserDto;

    try {
      //1. verificar si el usuario existe
      const user = await UserModel.findByIdAndUpdate(
        id,
        { status: false },
        { new: true }
      );
      if (!user) {
        throw CustomError.badRequest('User not exists');
      }

      //2. mapear la respuesta a nuestra entidad
      return 'User deleted';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  //metodo para genrar token--puede ser un caso de uso
  private async generateJWTTokenService(id: string) {
    const token = await JwtAdapter.generateToken({ id });
    if (!token) {
      throw CustomError.internalServer('Error generating token');
    }
    return token;
  }

  private async sendEmailValidationSixdigitToken(user: IEmail) {
    const html = `
      <h1>Valida tu email</h1>
      <p>Hola: ${user.name}, has creado tu cuenta, ya casi esta todo listo, solo debes confirmar tu cuenta </p>
      <p>Visita el siguiente enlace:</p>
      <a href="${envs.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
      <p>Ingresa el código: <b>${user.token}</b></p>
      <p>Exte token expira en 10 minutos</p>
    `;

    const options = {
      to: user.email,
      subject: 'Confirma tu cuenta',
      html,
    };
    try {
      const isSent = await this.emailservice.sendEmail(options);
      if (!isSent) {
        throw new Error('Error sending email');
      }
    } catch (error: any) {
      console.log(error);
      throw CustomError.internalServer('Error sending email 1');
    }
  }

  //este metodo puede ser un caso de uso -- metodo para enviar correo
  private async sendEmailValidationLink(email: string) {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) {
      throw CustomError.internalServer('Error generating token');
    }

    const link = `${envs.WEBSERVICE_URL}/api/auth/validate-email/${token}`;
    const html = `
      <h1>Validate your email</h1>
      <p>Please click the following link to validate your email:</p>
      <a href="${link}">validate your email: ${email}</a>
    `;

    const options = {
      to: email,
      subject: 'Validate your email',
      html,
    };

    // const isSent = await this.emailservice.sendEmail(options);
    // if (!isSent) {
    //   throw CustomError.internalServer('Error sending email')
    // }

    try {
      const isSent = await this.emailservice.sendEmail(options);
      if (!isSent) {
        throw new Error('Error sending email');
      }
    } catch (error: any) {
      console.log(error);
      throw CustomError.internalServer('Error sending email 2');
    }

    return true;
  }

  // metodo para validar token
  public async validateEmail(token: string) {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) {
      throw CustomError.unauthorized('Invalid token');
    }

    const { email } = payload as { email: string };
    if (!email) {
      throw CustomError.internalServer('Email not in token');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw CustomError.badRequest('User not found');
    }

    user.confirmed = true;
    await user.save();

    return true;
  }

  public async confirmSixDigitToken(confirmTokenDto: ConfirmTokenDto) {
    const { token } = confirmTokenDto;
    try {
      return await prisma.$transaction(async (prisma) => {
        const sixDigitTokenExists = await prisma.verificationToken.findFirst({
          where: {
            token,
            expiresAt: {
              gt: new Date(), // Verifica que no haya expirado
            },
          },
        });
        if (!sixDigitTokenExists) {
          throw CustomError.badRequest('Invalid token');
        }

        const updatedUser = await prisma.user.update({
          where: { id: sixDigitTokenExists.userId },
          data: {
            confirmed: true,
            VerificationToken: {
              update: {
                token: '',
              },
            },
          },
        });

        return {
          user: updatedUser,
          message: 'Cuenta confirmada exitosamente',
        };
      });
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    }
  }

  async requestConfirmationCode(
    requestConfirmationCodeDto: RequestConfirmationCodeDto
  ) {
    const { email } = requestConfirmationCodeDto;
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw CustomError.badRequest('Invalid credentials');
      }

      if (user.confirmed) {
        throw CustomError.badRequest('User already confirmed');
      }

      if (!user.confirmed) {
        await prisma.$transaction(async (prisma) => {
          const sixDigitsToken = generateSixDigitToken();
          await prisma.verificationToken.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              token: sixDigitsToken,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
            update: {
              token: sixDigitsToken,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
          });

          await this.sendEmailValidationSixdigitToken({
            email: user.email,
            name: user.name,
            token: sixDigitsToken,
          });
        });
      }

      return {
        user: UserResponseDto.create(user),
      };
    } catch (error: any) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    }
  }

  async forgotPassword(requestConfirmationCodeDto: RequestConfirmationCodeDto) {
    const { email } = requestConfirmationCodeDto;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw CustomError.badRequest('Invalid email');
      }

      await prisma.$transaction(async (prisma) => {
        const sixDigitsToken = generateSixDigitToken();
        await prisma.verificationToken.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            token: sixDigitsToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          },
          update: {
            token: sixDigitsToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          },
        });

        await this.sendEmaiForgotPassword({
          email: user.email,
          name: user.name,
          token: sixDigitsToken,
        });
      });

      return {
        user: UserResponseDto.create(user),
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    }
  }

  private async sendEmaiForgotPassword(user: IEmail) {
    const html = `
      <h1>Valida tu email</h1>
      <p>Hola: ${user.name}, has solicitado reestablecer tu password.</p>
      <p>Visita el siguiente enlace:</p>
      <a href="${envs.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
      <p>Ingresa el código: <b>${user.token}</b></p>
      <p>Exte token expira en 10 minutos</p>
    `;

    const options = {
      to: user.email,
      subject: 'Restablece tu password',
      html,
    };

    // const isSent = await this.emailservice.sendEmail(options);
    // if (!isSent) {
    //   throw CustomError.internalServer('Error sending email')
    // }

    try {
      const isSent = await this.emailservice.sendEmail(options);
      if (!isSent) {
        throw new Error('Error sending email');
      }
    } catch (error: any) {
      throw CustomError.internalServer('Error sending email');
    }
  }

  public async validateTokenToResetPassword(confirmTokenDto: ConfirmTokenDto) {
    const { token } = confirmTokenDto;
    try {
      const sixDigitTokenExists = await prisma.verificationToken.findFirst({
        where: { token },
      });

      if (!sixDigitTokenExists) {
        throw CustomError.badRequest('Invalid token');
      }

      return 'token valido, Define tu nuevo password';
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async updatePasswordWithToken(updatePasswordDto: UpdatePasswordDto) {
    const { token, password } = updatePasswordDto;

    try {
      const sixDigitTokenExists = await prisma.verificationToken.findFirst({
        where: { token },
      });

      if (!sixDigitTokenExists) {
        throw CustomError.badRequest('Invalid token');
      }

      const updatedUser = await prisma.user.update({
        where: { id: sixDigitTokenExists.userId },
        data: {
          password: this.hashPassword(password),
          VerificationToken: {
            update: {
              token: '',
            },
          },
        },
      });

      return 'El password se actualizó correctamente';
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    }
  }
}
