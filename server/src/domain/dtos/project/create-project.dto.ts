export class CreateProjectDto {
  private constructor(
    public projectName: string,
    public clientName: string,
    public description: string,
    public managerId: string
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateProjectDto?] {
    const { projectName, clientName, description, managerId } = object;

    if (!projectName) return ['Missing projectName'];
    if (!clientName) return ['Missing clientName'];
    if (!description) return ['Missing description'];
    if (!managerId) return ['Missing manager'];

    return [
      undefined,
      new CreateProjectDto(projectName, clientName, description, managerId),
    ];
  }
}
