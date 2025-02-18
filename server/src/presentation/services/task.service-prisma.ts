import { startSession } from 'mongoose';

import { TaskModel } from '../../data/mongodb/models/task.model';
import {
  CreateTaskDto,
  CustomError,
  TaskEntity,
  UpdateTaskDto,
} from '../../domain';
import { Project, Task, TaskStatus, User } from '@prisma/client';
import { prisma } from '../../data/prisma/prisma-db';

export class TaskServicePrisma {
  async createTask(createTaskDto: CreateTaskDto, projectId: Project['id']) {
    const { name, description } = createTaskDto;
    try {
      const task = await prisma.task.create({
        data: {
          name,
          description,
          projectId,
        },
      });

      return { task };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getTasksByProjectId(projectId: Project['id']) {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          projectId,
        },
        include: {
          completedBy: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          notes: {
            include: {
              createdBy: true,
            },
          },
        },
      });

      return { tasks };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);
      throw CustomError.internalServer();
    }
  }

  async getTaskById(taskId: Task['id']) {
    try {
      const taskDetails = await prisma.task.findUnique({
        where: {
          id: taskId,
        },
        include: {
          completedBy: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          notes: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return { task: taskDetails };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async updateTask(updateTaskdto: UpdateTaskDto, taskId: Task['id']) {
    const { name, description } = updateTaskdto;
    try {
      if (name === undefined && description === undefined) {
        throw CustomError.badRequest('No data to update');
      }
      const task = await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          name,
          description,
        },
      });

      return 'tarea actualizado correctamente';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);

      throw CustomError.internalServer();
    }
  }

  async deleteTask(projectId: Project['id'], taskId: Task['id']) {
    const session = await startSession();
    session.startTransaction();
    try {
      await prisma.task.delete({
        where: {
          id: taskId,
          projectId,
        },
      });
      return 'Tarea eliminada correctamente';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);

      throw CustomError.internalServer();
    }
  }

  async updateTaskStatus(updateTaskdto: UpdateTaskDto, task: any, userId: User['id']) {
    const { status } = updateTaskdto;
    try {
      if (status === undefined) {
        throw CustomError.badRequest('No data to update');
      }

      if (!this.isValidTaskStatus(status)) {
        throw CustomError.badRequest(
          `Invalid status. Valid values are: ${Object.values(TaskStatus).join(
            ', '
          )}`
        );
      }

      if (task.status === status) {
        throw CustomError.badRequest('Task already has this status');
      }

      await prisma.task.update({
        where: {
          id: task.id,
        },
        data: {
          status,
          completedBy: {
            create: {
              userId,
              status: task.status,
            },
          },
        },
      });

      return 'actualizada correctamente';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);
      throw CustomError.internalServer();
    }
  }

  private isValidTaskStatus(status: string): status is TaskStatus {
    return Object.values(TaskStatus).includes(status as TaskStatus);
  }
}
