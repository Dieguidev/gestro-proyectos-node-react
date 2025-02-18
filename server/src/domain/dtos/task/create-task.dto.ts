import { Validators } from '../../../config';

export class CreateTaskDto {
  private constructor(public name: string, public description: string) {}

  static create(object: { [key: string]: any }): [string?, CreateTaskDto?] {
    const { name, description, projectId } = object;

    if (!name) return ['Missing name'];
    if (!description) return ['Missing description'];
    if (!projectId) return ['Missing project id'];

    return [undefined, new CreateTaskDto(name, description)];
  }
}
