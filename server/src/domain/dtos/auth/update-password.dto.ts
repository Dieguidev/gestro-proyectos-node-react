export class UpdatePasswordDto {
  private constructor(
    public password: string,
    public passwordConfirmation: string,
    public token: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, UpdatePasswordDto?] {
    const { password, passwordConfirmation, token } = object;

    if (!password) return ['Missing password'];
    if (password.length < 6) return ['Password must be at least 6 characters'];
    if (!passwordConfirmation) return ['Missing passwordConfirmation'];
    if (passwordConfirmation !== password) return ['Passwords do not match'];
    if (!token) return ['Missing token'];
    if (token.length !== 6) return ['Invalid token'];

    return [undefined, new UpdatePasswordDto(password, passwordConfirmation, token)];
  }
}
