import fs from 'fs';
import path from 'path';

import { startSession } from "mongoose";
import { BcryptAdapter, envs, JwtAdapter } from "../../config";
import { SixDigitsTokenModel } from "../../data/mongodb/models/sixDigitsToken";
import { IUser, UserModel } from "../../data/mongodb/models/user.model";

import { CheckPasswordDto, ConfirmTokenDto, CustomError, generateSixDigitToken, GetAndDeleteUserDto, IEmail, LoginUserDto, RegisterUserDto, RequestConfirmationCodeDto, UpdateCurrentUserPasswordDto, UpdatePasswordDto, UpdateUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";


type HashFunction = (password: string) => string;
type ConpareFunction = (password: string, hashed: string) => boolean;




export class AuthService {

  constructor(
    //DI - Servicio Email
    private readonly emailservice: EmailService,
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: ConpareFunction = BcryptAdapter.compare,
  ) { }

  async registerUser(registerUserDto: RegisterUserDto) {

    const existUser = await UserModel.findOne({ email: registerUserDto.email })
    if (existUser) {
      throw CustomError.badRequest('User already exist')
    }
    const session = await startSession();
    try {
      session.startTransaction();
      const user = new UserModel(registerUserDto)

      //encriptar contraseña
      user.password = this.hashPassword(registerUserDto.password)
      user.confirmed = true
      await user.save({ session });

      const sixDigittoken = new SixDigitsTokenModel()
      sixDigittoken.token = generateSixDigitToken()
      sixDigittoken.user = user.id
      // console.log("Generated token:", sixDigittoken.token);
      await sixDigittoken.save({ session })

      //enviar correo de verificacion
      // await this.sendEmailValidationLink(user.email)

      const { password, ...userEntity } = UserEntity.fromJson(user)

      // const token = await this.generateTokenService(user.id)
      await this.sendEmailValidationSixdigitToken({ email: user.email, name: user.name, token: sixDigittoken.token })

      await session.commitTransaction();
      session.endSession();

      return {
        user: userEntity,
        // token
      }

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`)
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto
    const user = await UserModel.findOne({ email })
    if (!user) {
      throw CustomError.badRequest('User or email invalid')
    }


    //ismatch ..bcrypt
    const isMatchPassword = this.comparePassword(password, user.password)
    if (!isMatchPassword) {
      throw CustomError.badRequest('Invalid credentials')
    }
    if (!user.confirmed) {
      const sixDigitoken = new SixDigitsTokenModel()
      sixDigitoken.token = generateSixDigitToken()
      sixDigitoken.user = user.id
      await sixDigitoken.save()

      await this.sendEmailValidationSixdigitToken({ email: user.email, name: user.name, token: sixDigitoken.token })
      throw CustomError.badRequest('User not confirmed')
    }

    const { password: _, ...userEntity } = UserEntity.fromJson(user)

    const token = await this.generateTokenService(user.id)

    return {
      // user: userEntity,
      token
    }
  }


  async update(updateUserDto: UpdateUserDto, user: any) {
    const { name, email } = updateUserDto;
    try {

      const userExist = await UserModel.findOne({ email });
      if (userExist && userExist.id.toString() !== user.id.toString()) {
        throw CustomError.badRequest('Ese email ya esta en uso');
      }

      user.name = name;
      user.email = email;
      await user.save();

      return 'Perfil actualizado correctamente'

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(error);

      throw CustomError.internalServer();
    }
  }


  async delete(getAndDeleteUserDto: GetAndDeleteUserDto) {
    const { id } = getAndDeleteUserDto;

    try {
      //1. verificar si el usuario existe
      const user = await UserModel.findByIdAndUpdate(id, { status: false }, { new: true });
      if (!user) {
        throw CustomError.badRequest('User not exists');
      }

      //2. mapear la respuesta a nuestra entidad
      return "User deleted"

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }


  //metodo para genrar token--puede ser un caso de uso
  private async generateTokenService(id: string) {
    const token = await JwtAdapter.generateToken({ id })
    if (!token) {
      throw CustomError.internalServer('Error generating token')
    }
    return token
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
    }

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
      // Guardar el error en un archivo
      console.log(error);

      const logFilePath = path.join(__dirname, 'error.log');
      const logMessage = `Error al enviar correo a ${user.email}\nError: ${error.message}\n\n`;
      fs.appendFileSync(logFilePath, logMessage);
      throw CustomError.internalServer('Error sending email 1');
    }
  }

  //este metodo puede ser un caso de uso -- metodo para enviar correo
  private async sendEmailValidationLink(email: string) {
    const token = await JwtAdapter.generateToken({ email })
    if (!token) {
      throw CustomError.internalServer('Error generating token')
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
    }

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
      // Guardar el error en un archivo
      const logFilePath = path.join(__dirname, 'error.log');
      const logMessage = `Error al enviar correo a \nError: ${error.message}\n\n`;
      fs.appendFileSync(logFilePath, logMessage);
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

    const { email } = payload as { email: string }
    if (!email) {
      throw CustomError.internalServer('Email not in token');
    };

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw CustomError.badRequest('User not found');
    };

    user.confirmed = true;
    await user.save();

    return true;
  }

  public async confirmSixDigitToken(confirmTokenDto: ConfirmTokenDto) {
    const session = await startSession();
    try {
      session.startTransaction();
      const sixDigitTokenExists = await SixDigitsTokenModel.findOne({
        token: confirmTokenDto.token
      })
      if (!sixDigitTokenExists) {
        throw CustomError.badRequest('Invalid token')
      }

      const user = await UserModel.findById(sixDigitTokenExists.user)
      if (!user) {
        throw CustomError.badRequest('User not found')
      }
      user.confirmed = true
      await user.save({ session })
      await sixDigitTokenExists.deleteOne({ session })

      await session.commitTransaction();
      session.endSession();

      return user
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`)
    }
  }


  async requestConfirmationCode(requestConfirmationCodeDto: RequestConfirmationCodeDto) {
    const session = await startSession();
    session.startTransaction();

    const existUser = await UserModel.findOne({ email: requestConfirmationCodeDto.email })
    if (!existUser) {
      throw CustomError.badRequest('User not exist')
    }
    if (existUser.confirmed) {
      throw CustomError.badRequest('User already confirmed')
    }
    try {

      const sixDigittoken = new SixDigitsTokenModel()
      sixDigittoken.token = generateSixDigitToken()
      sixDigittoken.user = existUser.id
      // console.log("Generated token:", sixDigittoken.token);
      await sixDigittoken.save({ session })

      //enviar correo de verificacion
      // await this.sendEmailValidationLink(user.email)

      const { password, ...userEntity } = UserEntity.fromJson(existUser)

      // const token = await this.generateTokenService(user.id)
      await this.sendEmailValidationSixdigitToken({ email: existUser.email, name: existUser.name, token: sixDigittoken.token })

      await session.commitTransaction();
      session.endSession();

      return {
        user: userEntity,
        // token
      }

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`)
    }
  }


  async forgotPassword(requestConfirmationCodeDto: RequestConfirmationCodeDto) {
    const session = await startSession();

    try {
      await session.withTransaction(async () => {
        const existUser = await UserModel.findOne({ email: requestConfirmationCodeDto.email }).session(session);
        if (!existUser) {
          throw CustomError.badRequest('User not exist');
        }

        const sixDigittoken = new SixDigitsTokenModel();
        sixDigittoken.token = generateSixDigitToken();
        sixDigittoken.user = existUser.id;
        await sixDigittoken.save({ session });

        const { password, ...userEntity } = UserEntity.fromJson(existUser);

        await this.sendEmaiForgotPassword({ email: existUser.email, name: existUser.name, token: sixDigittoken.token });

        return {
          user: userEntity,
        };
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`);
    } finally {
      session.endSession();
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
    }

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
      // Guardar el error en un archivo
      const logFilePath = path.join(__dirname, 'error.log');
      const logMessage = `Error al enviar correo a ${user.email}\nError: ${error.message}\n\n`;
      fs.appendFileSync(logFilePath, logMessage);
      throw CustomError.internalServer('Error sending email');
    }
  }

  public async validateTokenFromResetPassword(confirmTokenDto: ConfirmTokenDto) {
    try {
      const sixDigitTokenExists = await SixDigitsTokenModel.findOne({
        token: confirmTokenDto.token
      })
      if (!sixDigitTokenExists) {
        throw CustomError.badRequest('Invalid token')
      }

      return 'token valido, Define tu nuevo password'
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`)
    }
  }

  public async updatePasswordWithToken(updatePasswordDto: UpdatePasswordDto) {
    const { token, password } = updatePasswordDto;
    console.log(token, password);

    const session = await startSession();
    session.startTransaction();
    try {
      const sixDigitTokenExists = await SixDigitsTokenModel.findOne({
        token
      })

      if (!sixDigitTokenExists) {
        throw CustomError.badRequest('Invalid token')
      }

      const user = await UserModel.findById(sixDigitTokenExists.user)
      console.log(user);

      if (!user) {
        throw CustomError.badRequest('User not found')
      }
      user!.password = this.hashPassword(password)
      await user!.save({ session })
      await sixDigitTokenExists.deleteOne({ session })

      await session.commitTransaction();
      session.endSession();

      return 'El password se actualizó correctamente'
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.log(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(`${error}`)
    }
  }

  public async user(user: unknown) {
    return {
      user,
    }
  }


  public async updateCurrentUserPassword(UpdateCurrentUserPasswordDto: UpdateCurrentUserPasswordDto, user: any) {
    const { currentPassword, password } = UpdateCurrentUserPasswordDto;

    try {
      const existsUser = await UserModel.findById(user.id)

      const isMatchPassword = this.comparePassword(currentPassword, existsUser!.password)
      if (!isMatchPassword) {
        throw CustomError.badRequest('El password actual no coincide')
      }

      existsUser!.password = this.hashPassword(password)
      await existsUser!.save();

      return 'Password actualizado correctamente'
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  public async checkPassword(checkPasswordDto: CheckPasswordDto, user: any) {
    const { password } = checkPasswordDto;

    try {
      const existsUser = await UserModel.findById(user.id)

      const isMatchPassword = this.comparePassword(password, existsUser!.password)
      if (!isMatchPassword) {
        throw CustomError.badRequest('El password actual no coincide')
      }

      return 'Password correcto'
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

}
