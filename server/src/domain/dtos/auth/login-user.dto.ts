import { Validators } from "../../../config";




export class LoginUserDto {


  private constructor(
    public email: string,
    public password: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { email, password } = object;

    if (!email) return ['Missing email'];
    if(!Validators.email.test(email)) return ['Invalid email'];
    if (!password) return ['Missing password'];
    if (password.length < 8) return ['El password minimo debe ser de 8 caracteres'];


    return [undefined, new LoginUserDto( email.toLowerCase(), password)];

  }
}
