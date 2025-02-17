import { User } from "@prisma/client";

export class UserResponseDto {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public confirmed: boolean,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(user: User): UserResponseDto {
    return new UserResponseDto(
      user.id,
      user.email,
      user.name,
      user.confirmed,
      user.isActive,
      user.createdAt,
      user.updatedAt,
    );
  }
}
