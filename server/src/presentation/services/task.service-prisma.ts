import { startSession } from 'mongoose';

import { TaskModel } from '../../data/mongodb/models/task.model';
import {
  CreateTaskDto,
  CustomError,
  TaskEntity,
  UpdateTaskDto,
} from '../../domain';
import { Project, Task } from '@prisma/client';
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

      console.log('updateTaskdto', updateTaskdto);


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

  async deleteTask(project: any, task: any) {
    const session = await startSession();
    session.startTransaction();
    try {
      project.tasks = project.tasks.filter(
        (taskId: string) => taskId?.toString() !== task.id
      );

      await task.deleteOne({ session });
      await project.save({ session });

      await session.commitTransaction();
      session.endSession();

      return TaskEntity.fromJson(task);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async updateTaskStatus(updateTaskdto: UpdateTaskDto, task: any, user: any) {
    const { status } = updateTaskdto;
    try {
      if (status === undefined) {
        throw CustomError.badRequest('No data to update');
      }
      task.status = status;

      const data = {
        user: user.id,
        status,
      };

      task.completedBy.push(data);
      await task.save();

      return TaskEntity.fromJson(task);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }
}
