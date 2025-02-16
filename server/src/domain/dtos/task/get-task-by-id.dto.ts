import { Validators } from "../../../config";

export class GetTaskByIdDto {
  private constructor(
    public id: string,
    public projectId: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, GetTaskByIdDto?] {
    const { id, projectId } = object;

    if (!id) return ['Missing id'];
    if (!Validators.isMongoID(id)) return ['Invalid projectId']
    if (!projectId) return ['Missing projectIdvvvv'];
    if (!Validators.isMongoID(projectId)) return ['Invalid projectId']

    return [undefined, new GetTaskByIdDto(id, projectId)]
  }
}
