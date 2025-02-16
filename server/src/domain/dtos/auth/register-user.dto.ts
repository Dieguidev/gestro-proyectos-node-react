import { Validators } from "../../../config";




export class RegisterUserDto {


  private constructor(
    public name: string,
    public email: string,
    public password: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const { name, email, password, passwordConfirmation } = object;

    if (!name) return ['Missing name'];
    if (!email) return ['Missing email'];
    if(!Validators.email.test(email)) return ['Invalid email'];
    if (!password) return ['Missing password'];
    if (password.length < 6) return ['Password must be at least 6 characters'];
    if (!passwordConfirmation) return ['Missing password confirmation'];
    if (password !== passwordConfirmation) return ['Passwords do not match'];

    return [undefined, new RegisterUserDto(name, email.toLowerCase(), password)];

  }
}
