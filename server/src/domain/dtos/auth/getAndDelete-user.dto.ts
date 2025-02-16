import { Validators } from "../../../config";




export class GetAndDeleteUserDto {


  private constructor(
    public id: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, GetAndDeleteUserDto?] {
    const { id } = object;

    if (!id) return ['Missing id'];
    if (!Validators.isMongoID(id)) return ['Invalid Id']

    return [undefined, new GetAndDeleteUserDto(id)];
  }
}
