export class UpdateTaskDto {
  private constructor(
    public name?: string,
    public description?: string,
    public status?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateTaskDto?] {
    const { name, description, status } = object;

    if (name && typeof name !== 'string') return ['Invalid name'];
    if (description && typeof description !== 'string') return ['Invalid description'];

    return [undefined, new UpdateTaskDto(name, description, status)];
  }
}
