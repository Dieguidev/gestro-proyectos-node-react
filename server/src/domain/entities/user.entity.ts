import { CustomError } from "../errors/custom.error";

export class UserEntity {

  constructor(
    public id: string,
    public name: string,
    public email: string,
    public confirmed: boolean,
    public password: string,
    // public role: string[],
    // public img?: number,
  ) { }

  static fromJson(object: { [key: string]: any }): UserEntity {
    const {
      id, _id,
      name,
      email,
      confirmed,
      password,
k
    } = object;

    if (!id && !_id) throw CustomError.badRequest('Missing ID');
    if (!name) throw CustomError.badRequest('Missing username');
    if (!email) throw CustomError.badRequest('Missing email');
    if (confirmed === undefined) throw CustomError.badRequest('Missing email validated');
    if (!password) throw CustomError.badRequest('Missing password');
    // if (!role) throw CustomError.badRequest('Missing role');

    return new UserEntity(
      id || _id,
      name,
      email,
      confirmed,
      password,
      // role,
      // img
    );
  }
}
