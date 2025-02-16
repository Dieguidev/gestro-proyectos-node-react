import { IProject, IUser, ProjectModel, UserModel } from "../../data/mongodb";
import { CreateProjectDto, CustomError, DeleteProjectDto, GetByIdProjectDto, PaginationDto, ProjectEntity, UpdateProjectDto } from "../../domain";
import { FindMemberByEmailDto } from '../../domain/dtos/team/find-member-by-email.dto';
import { AddTeamMemberDto } from '../../domain/dtos/team/add-team-member.dto';
import path from "path";


export class ProjectService {
  async createProject(creaProjectDto: CreateProjectDto) {
    try {
      const project = new ProjectModel(creaProjectDto);

      await project.save();

      return { project: ProjectEntity.fromJson(project) };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }


  async getAllProjects(paginationDto: PaginationDto, userId: IUser['_id']) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [total, projects] = await Promise.all([
        ProjectModel.countDocuments(),
        ProjectModel.find({
          $or: [
            { manager: { $in: userId } },
            { team: { $in: userId } }
          ]
        })
          .skip(skip)
          .limit(limit)
      ])

      const listProjects: ProjectEntity[] = projects.map((project: IProject) => ProjectEntity.fromJson(project));

      return {
        page,
        limit,
        total: total,
        next: (total - (page * limit)) > 0 ? `/api/categories?page=${page + 1}&limit=${limit}` : null,
        prev: (page - 1 > 0) ? `/api/categories?page=${page - 1}&limit=${limit}` : null,
        projects: listProjects
      }

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }


  async getProjectById(getByIdProjectDto: GetByIdProjectDto, userId: IUser['_id']) {
    const { id } = getByIdProjectDto;
    try {
      const project = await ProjectModel.findById(id).populate('tasks').exec();
      if (!project) {
        throw CustomError.notFound('Project not found');
      }

      console.log(project.manager!, userId);
      console.log(project.team);

      const projectTeamstoString = project.team.map((id: any) => id.toString());



      if (project.manager!.toString() !== userId && !projectTeamstoString.includes(userId)) {
        throw CustomError.forbidden('Acción no válida');
      }

      return { project: ProjectEntity.fromJson(project) };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async deleteProject(project: any) {
    try {
      await project.deleteOne();
      return 'Project deleted';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);

      throw CustomError.internalServer();
    }
  }


  async updateProject(updateProjectDto: UpdateProjectDto, project: any) {
    const { clientName, description, projectName } = updateProjectDto
    try {
      project.clientName = clientName;
      project.description = description;
      project.projectName = projectName;
      await project.save();

      return { project: ProjectEntity.fromJson(project) };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }



  async findMemberByEmail(findMemberByEmailDto: FindMemberByEmailDto) {
    const { email } = findMemberByEmailDto;
    try {
      const user = await UserModel.findOne({ email }).select('id name email');
      if (!user) {
        throw CustomError.notFound('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async addMemberById(addTeamMemberDto: AddTeamMemberDto, project: any) {
    const { userId } = addTeamMemberDto;

    const user = await UserModel.findById(userId).select('id');
    if (!user) {
      throw CustomError.notFound('Usuario no encontrado');
    }

    if (project.team.includes(user.id)) {
      throw CustomError.badRequest('Usuario ya se encuentra en el equipo');
    }

    project.team.push(user.id);
    await project.save();


    return 'Usuario agregado correctamente';

  }
  async removeMemberById(addTeamMemberDto: AddTeamMemberDto, project: any) {
    const { userId } = addTeamMemberDto;

    if (!project.team.includes(userId)) {
      throw CustomError.badRequest('Usuario no se encuentra en el proyecto');
    }

    project.team = project.team.filter((id: string) => id.toString() !== userId.toString());
    await project.save();

    return 'Usuario eliminado correctamente';
  }

  async getMembers(project: any) {
    const members = await project.populate({
      path: 'team',
      select: 'id name email'
    });
    return members.team;
  }
}
