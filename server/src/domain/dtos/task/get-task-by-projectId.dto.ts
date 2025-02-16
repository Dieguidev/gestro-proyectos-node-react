import { Validators } from "../../../config";

export class GetTasksByProjectIdDto {
  private constructor(
    public projectId: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, GetTasksByProjectIdDto?] {
    const { projectId } = object;

    if (!projectId) return ['Missing project id'];
    if (!Validators.isMongoID(projectId)) return ['Invalid projectId']

    return [undefined, new GetTasksByProjectIdDto(projectId)]
  }
}
