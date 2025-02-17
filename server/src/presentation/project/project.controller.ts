import { Request, Response } from 'express';
import {
  AddTeamMemberDto,
  CreateProjectDto,
  CustomError,
  DeleteProjectDto,
  FindMemberByEmailDto,
  GetByIdProjectDto,
  PaginationDto,
  UpdateProjectDto,
} from '../../domain';
import { ProjectService } from '../services/project.service';
import { ProjectServicePrisma } from '../services/project.service-prisma';

export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectServicePrimsa: ProjectServicePrisma
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);

    return res.status(500).json({ error: 'Internal Server Error' });
  };

  createProject = (req: Request, res: Response) => {
    const [error, cerateProjectDto] = CreateProjectDto.create({
      ...req.body,
      managerId: req.userPrisma!.id,
    });
    if (error) return res.status(400).json({ error });

    this.projectServicePrimsa
      .createProject(cerateProjectDto!)
      .then((project) => res.json(project))
      .catch((error) => this.handleError(error, res));
  };

  getAllProjects = (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) return res.status(400).json({ error });

    this.projectServicePrimsa
      .getAllProjects(paginationDto!, req.userPrisma!.id)
      .then((projects) => res.json(projects))
      .catch((error) => this.handleError(error, res));
  };

  getProjectById = (req: Request, res: Response) => {
    const { projectId } = req.params;
    const [error, getByIdProjectDto] = GetByIdProjectDto.create({ projectId });
    if (error) return res.status(400).json({ error });

    this.projectServicePrimsa
      .getProjectById(getByIdProjectDto!, req.userPrisma!.id)
      .then((project) => res.json(project))
      .catch((error) => this.handleError(error, res));
  };

  updateProject = (req: Request, res: Response) => {
    const [error, updateProjectDto] = UpdateProjectDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.projectServicePrimsa
      .updateProject(updateProjectDto!, req.project?.id!)
      .then((project) => res.json(project))
      .catch((error) => this.handleError(error, res));
  };

  deleteProject = (req: Request, res: Response) => {
    this.projectServicePrimsa
      .deleteProject(req.project?.id!)
      .then((rpta) => res.json(rpta))
      .catch((error) => this.handleError(error, res));
  };

  findMemberByEmail = (req: Request, res: Response) => {
    const [error, findMemberByEmailDto] = FindMemberByEmailDto.create(req.body);
    if (error) return res.status(400).json({ error });
    this.projectServicePrimsa
      .findMemberByEmail(findMemberByEmailDto!)
      .then((member) => res.json(member))
      .catch((error) => this.handleError(error, res));
  };

  addMemberById = (req: Request, res: Response) => {
    const [error, addTeamMemberDto] = AddTeamMemberDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.projectServicePrimsa
      .addMemberById(addTeamMemberDto!, req.project?.id!)
      .then((member) => res.json(member))
      .catch((error) => this.handleError(error, res));
  };

  removeMemberById = (req: Request, res: Response) => {
    const { userId } = req.params;
    const [error, addTeamMemberDto] = AddTeamMemberDto.create({ userId });
    if (error) return res.status(400).json({ error });

    this.projectService
      .removeMemberById(addTeamMemberDto!, req.project!)
      .then((member) => res.json(member))
      .catch((error) => this.handleError(error, res));
  };

  getMembers = (req: Request, res: Response) => {
    this.projectService
      .getMembers(req.project!)
      .then((members) => res.json(members))
      .catch((error) => this.handleError(error, res));
  };
}
