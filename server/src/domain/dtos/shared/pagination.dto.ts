


export class PaginationDto {
  private constructor(
    public readonly page: number,
    public readonly limit: number,
  ) { }

  static create(page: number = 1, limit: number = 10): [string?, PaginationDto?] {

    if (isNaN(page) || isNaN(limit)) {
      return ['Invalid pagination parameters must a numbers']
    }

    if (page <= 0) return ['Page must be greater than 0'];
    if (limit <= 0) return ['Limit must be greater than 0'];
    if (limit > 100) return ['Limit must be less than 100'];
    if (page > 1000) return ['Page must be less than 1000'];
    if (limit > 1000) return ['Limit must be less than 1000'];



    return [undefined, new PaginationDto(page, limit)]
  }
}
