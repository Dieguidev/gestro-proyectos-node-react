import { Validators } from "../../../config";



export class GetByIdProjectDto {

  private constructor(
    public projectId: string,
  ){}

  static create(object: { [key: string]: any }): [string?, GetByIdProjectDto?] {
    const { projectId } = object;


    if (!projectId) return ['Missing id'];
    if (!Validators.isUUID(projectId)) return ['Invalid Id']

    return [undefined, new GetByIdProjectDto(projectId)]
  }
}
