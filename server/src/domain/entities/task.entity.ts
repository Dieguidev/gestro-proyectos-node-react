import { CustomError } from "../errors/custom.error";


export class TaskEntity {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public projectId: string,
    public status: string,
    public createdAt: Date,
    public updatedAt: Date,
    public completedBy?: string | null,
    public notes: string[] = []
  ) { }

  static fromJson(object: { [key: string]: any }): TaskEntity {
    const { id, _id, name, description, projectId, status, createdAt, updatedAt, completedBy, notes } = object;

    if (!id && !_id) throw CustomError.badRequest('Missing ID');
    if (!name) throw CustomError.badRequest('Missing name');
    if (!description) throw CustomError.badRequest('Missing description');
    if (!projectId) throw CustomError.badRequest('Missing project ID');
    if (!status) throw CustomError.badRequest('Missing status');

    return new TaskEntity(id || _id, name, description, projectId, status, createdAt, updatedAt, completedBy, notes);
  }
}
