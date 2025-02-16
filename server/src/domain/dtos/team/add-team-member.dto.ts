import { Validators } from "../../../config";


export class AddTeamMemberDto {
  private constructor(
    public userId: string
  ) { }

  static create(object: { [key: string]: any }): [string?, AddTeamMemberDto?] {
    const { userId } = object;

    if (!userId) return ['Missing userId'];
    if(!Validators.isMongoID(userId)) return ['Invalid userId']

    return [undefined, new AddTeamMemberDto( userId)]
  }
}
