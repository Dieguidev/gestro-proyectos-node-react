import { Validators } from "../../../config";

export class ForgotPasswordDto {
  private constructor(
    public email: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, ForgotPasswordDto?] {
    const { email } = object;

    if (!email) return ['Missing email'];
    if (!Validators.email.test(email)) return ['Invalid email'];

    return [undefined, new ForgotPasswordDto(email)];
  }
}
