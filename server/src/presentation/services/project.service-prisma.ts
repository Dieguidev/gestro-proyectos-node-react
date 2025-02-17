import { IProject, IUser, ProjectModel, UserModel } from '../../data/mongodb';
import {
  CreateProjectDto,
  CustomError,
  DeleteProjectDto,
  GetByIdProjectDto,
  PaginationDto,
  ProjectEntity,
  UpdateProjectDto,
} from '../../domain';
import { FindMemberByEmailDto } from '../../domain/dtos/team/find-member-by-email.dto';
import { AddTeamMemberDto } from '../../domain/dtos/team/add-team-member.dto';
import { prisma } from '../../data/prisma/prisma-db';
import { Project, User } from '@prisma/client';

export class ProjectServicePrisma {
  async createProject(creaProjectDto: CreateProjectDto) {
    try {
      const project = await prisma.project.create({
        data: creaProjectDto,
      });

      return { project };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  //TODO: Falta verificación de proyectos donde eres miembro
  async getAllProjects(paginationDto: PaginationDto, userId: User['id']) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [total, projects] = await Promise.all([
        prisma.project.count({
          where: {
            OR: [
              { managerId: userId },
              {
                TeamProject: {
                  some: {
                    userId,
                  },
                },
              },
            ],
          },
        }),
        prisma.project.findMany({
          where: {
            OR: [
              { managerId: userId },
              {
                TeamProject: {
                  some: {
                    userId,
                  },
                },
              },
            ],
          },
          skip,
          take: limit,
        }),
      ]);

      return {
        page,
        limit,
        total: total,
        next:
          total - page * limit > 0
            ? `/api/project?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0 ? `/api/project?page=${page - 1}&limit=${limit}` : null,
        projects,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  //TODO: Falta verificación de proyectos donde eres miembro
  async getProjectById(
    getByIdProjectDto: GetByIdProjectDto,
    userId: User['id']
  ) {
    const { projectId } = getByIdProjectDto;
    try {
      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
        },
        include: {
          TeamProject: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (!project) {
        throw CustomError.notFound('Project not found');
      }

      if (
        project.managerId !== userId &&
        !project.TeamProject.some((team) => team.userId === userId)
      ) {
        throw CustomError.forbidden('Acción no válida');
      }

      // const projectTeamstoString = project.team.map((id: any) => id.toString());

      // if (
      //   project.manager!.toString() !== userId &&
      //   !projectTeamstoString.includes(userId)
      // ) {
      //   throw CustomError.forbidden('Acción no válida');
      // }

      return { project };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async deleteProject(projectId: Project['id']) {
    try {
      await prisma.project.delete({
        where: {
          id: projectId,
        },
      });
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
    const { clientName, description, projectName } = updateProjectDto;
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

    project.team = project.team.filter(
      (id: string) => id.toString() !== userId.toString()
    );
    await project.save();

    return 'Usuario eliminado correctamente';
  }

  async getMembers(project: any) {
    const members = await project.populate({
      path: 'team',
      select: 'id name email',
    });
    return members.team;
  }
}
