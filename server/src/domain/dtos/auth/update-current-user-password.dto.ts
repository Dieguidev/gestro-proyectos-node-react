export class UpdateCurrentUserPasswordDto {
  private constructor(
    public currentPassword: string,
    public password: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, UpdateCurrentUserPasswordDto?] {
    const { currentPassword, password, passwordConfirmation } = object;

    if (!currentPassword) return ['El password actual es requerido'];
    if (!password) return ['El nuevo password es requerido'];
    if (password.length < 8) return ['El nuevo password debe tener al menos 8 caracteres'];
    if (!passwordConfirmation) return ['La confirmación del password es requerida'];
    if (password !== passwordConfirmation) return ['Los passwords no coinciden'];

    return [undefined, new UpdateCurrentUserPasswordDto(currentPassword, password)];
  }
}
