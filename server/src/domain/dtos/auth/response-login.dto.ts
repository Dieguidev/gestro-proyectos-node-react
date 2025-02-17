import { User } from "@prisma/client";
import { UserResponseDto } from "./response-user.dto";

export class LoginResponseDto {
  constructor(
    public user: UserResponseDto,
    public token: string
  ) {}

  static create(user: User, token: string): LoginResponseDto {
    return new LoginResponseDto(
      UserResponseDto.create(user),
      token
    );
  }
}
