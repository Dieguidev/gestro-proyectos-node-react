import { User } from "@prisma/client";
import { UserResponseDto } from "./response-user.dto";

export class AuthResponseDto {
  constructor(
    public user: UserResponseDto,
    public token?: string
  ) {}

  static create(user: User, token: string): AuthResponseDto {
    return new AuthResponseDto(
      UserResponseDto.create(user),
      token
    );
  }
}
