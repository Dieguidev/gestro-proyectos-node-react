export class CheckPasswordDto {
  private constructor(
    public readonly password: string,
  ) { }
  static create(object: { [key: string]: any }): [string?, CheckPasswordDto?] {
    const { password } = object;

    if (!password) return ['El password es requerido'];

    return [undefined, new CheckPasswordDto(password)];
  }
}
