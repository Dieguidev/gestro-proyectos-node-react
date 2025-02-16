import { Validators } from "../../../config";



export class GetByIdProjectDto {

  private constructor(
    public id: string,
  ){}

  static create(object: { [key: string]: any }): [string?, GetByIdProjectDto?] {
    const { id } = object;

    if (!id) return ['Missing id'];
    if (!Validators.isMongoID(id)) return ['Invalid Id']

    return [undefined, new GetByIdProjectDto(id)]
  }
}
