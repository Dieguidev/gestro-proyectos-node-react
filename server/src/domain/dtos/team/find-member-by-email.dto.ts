import { Validators } from "../../../config";


export class FindMemberByEmailDto {
  private constructor(
    public email: string
  ) { }

  static create(object: { [key: string]: any }): [string?, FindMemberByEmailDto?] {
    const { email } = object;

    if (!email) return ['Missing email'];
    if (!Validators.email.test(email)) return ['Invalid email']



    return [undefined, new FindMemberByEmailDto(email)]
  }
}
