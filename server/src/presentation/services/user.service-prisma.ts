import { User } from "@prisma/client";
import { CustomError, UpdateUserDto } from "../../domain";
import { prisma } from "../../data/prisma/prisma-db";

export class UserServicePrisma {
  constructor() { }
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
            email
          }
        })

        return 'Perfil actualizado correctamente';
      } catch (error) {
        if (error instanceof CustomError) {
          throw error;
        }
        console.log(error);

        throw CustomError.internalServer();
      }
    }
  // delete(getAndDeleteUserDto) {
  //   throw new Error('Method not implemented.');
  // }
}
