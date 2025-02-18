import { startSession } from 'mongoose';

import { TaskModel } from '../../data/mongodb/models/task.model';
import {
  CreateTaskDto,
  CustomError,
  TaskEntity,
  UpdateTaskDto,
} from '../../domain';
import { Project } from '@prisma/client';
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

  async getTasksByProjectId(project: any) {
    try {
      const tasks = await project.populate({
        path: 'tasks',
      });

      return tasks.tasks.map((task: any) => TaskEntity.fromJson(task));
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getTaskById(task: any) {
    try {
      const taskDetails = await TaskModel.findById(task.id)
        .populate({
          path: 'completedBy.user',
          select: 'id name email',
        })
        .populate({
          path: 'notes',
          populate: { path: 'createdBy', select: 'id name email' },
        });

      return TaskEntity.fromJson(taskDetails as any);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async updateTask(updateTaskdto: UpdateTaskDto, task: any) {
    const { name, description } = updateTaskdto;
    try {
      if (name === undefined && description === undefined) {
        throw CustomError.badRequest('No data to update');
      }
      if (name !== undefined) {
        task.name = name;
      }
      if (description !== undefined) {
        task.description = description;
      }
      await task.save();

      return TaskEntity.fromJson(task);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
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
