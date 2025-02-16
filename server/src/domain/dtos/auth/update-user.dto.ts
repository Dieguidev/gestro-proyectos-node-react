import { Validators } from "../../../config";




export class UpdateUserDto {


  private constructor(
    public name: string,
    public email: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, UpdateUserDto?] {
    const { name, email } = object;

    if (!name) return ['Missing name'];
    if(!email) return ['Missing email'];

    if (email && !Validators.email.test(email)) return ['Invalid email'];

    return [undefined, new UpdateUserDto(name, email ? email.toLowerCase() : undefined)];
  }
}
