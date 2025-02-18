export class CreateNoteDto {
  private constructor(public content: string) {}

  static create(object: { [key: string]: any }): [string?, CreateNoteDto?] {
    const { content } = object;

    if (!content) return ['Missing content field'];

    return [undefined, new CreateNoteDto(content)];
  }
}
