import { User } from '@prisma/client';
import {
  CustomError,
  UpdateCurrentUserPasswordDto,
  UpdateUserDto,
} from '../../domain';
import { prisma } from '../../data/prisma/prisma-db';
import { UserResponseDto } from '../../domain/dtos/auth/response-user.dto';
import { BcryptAdapter } from '../../config';

type HashFunction = (password: string) => string;
type ConpareFunction = (password: string, hashed: string) => boolean;

export class UserServicePrisma {
  constructor(
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: ConpareFunction = BcryptAdapter.compare
  ) {}
  async update(updateUserDto: UpdateUserDto, user: User) {
    const { name, email } = updateUserDto;
    try {
      const userExist = await prisma.user.findUnique({ where: { email } });
      if (userExist && userExist.id.toString() !== user.id.toString()) {
        throw CustomError.badRequest('That email is already in use');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          email,
        },
      });

      return 'Perfil actualizado correctamente';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(error);

      throw CustomError.internalServer();
    }
  }
  // async delete(getAndDeleteUserDto: GetAndDeleteUserDto) {
  //   const { id } = getAndDeleteUserDto;

  //   try {
  //     //1. verificar si el usuario existe
  //     const user = await UserModel.findByIdAndUpdate(
  //       id,
  //       { status: false },
  //       { new: true }
  //     );
  //     if (!user) {
  //       throw CustomError.badRequest('User not exists');
  //     }

  //     //2. mapear la respuesta a nuestra entidad
  //     return 'User deleted';
  //   } catch (error) {
  //     if (error instanceof CustomError) {
  //       throw error;
  //     }
  //     throw CustomError.internalServer();
  //   }
  // }

  async user(user: User) {
    return {
      user: UserResponseDto.create(user),
    };
  }

  public async updateCurrentUserPassword(
    UpdateCurrentUserPasswordDto: UpdateCurrentUserPasswordDto,
    user: User
  ) {
    const { currentPassword, password } = UpdateCurrentUserPasswordDto;

    try {
      const isMatchPassword = this.comparePassword(
        currentPassword,
        user.password
      );
      if (!isMatchPassword) {
        throw CustomError.badRequest('El password actual no coincide');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: this.hashPassword(password),
        },
      });

      return 'Password actualizado correctamente';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }
}
