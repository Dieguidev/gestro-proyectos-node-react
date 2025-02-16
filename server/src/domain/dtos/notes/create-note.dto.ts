export class CreateNoteDto {
  private constructor(
    public content: string,
  ){}

  static create(object: { [key: string]: any }): [string?, CreateNoteDto?] {
    const { content, taskId, projectId } = object;

    if (!content) return ['Missing note'];


    return [undefined, new CreateNoteDto(content)];
  }
}
