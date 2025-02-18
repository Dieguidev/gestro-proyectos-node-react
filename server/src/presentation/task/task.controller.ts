import { Request, Response } from 'express';
import { CreateTaskDto, CustomError, UpdateTaskDto } from '../../domain';
import { TaskServicePrisma } from '../services/task.service-prisma';

export class TaskController {
  constructor(
    private readonly taskServicePrisma: TaskServicePrisma
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);

    return res.status(500).json({ error: 'Internal Server Error' });
  };

  createTask = (req: Request, res: Response) => {
    const [error, createTaskDto] = CreateTaskDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.taskServicePrisma
      .createTask(createTaskDto!, req.project!.id)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  };

  getTasksByProjectId = (req: Request, res: Response) => {
    this.taskServicePrisma
      .getTasksByProjectId(req.project!.id)
      .then((tasks) => res.json(tasks))
      .catch((error) => this.handleError(error, res));
  };

  getTaskById = (req: Request, res: Response) => {
    this.taskServicePrisma
      .getTaskById(req.task!.id)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  };

  updateTask = (req: Request, res: Response) => {
    const { name, description } = req.body;

    const [error, updateTaskDto] = UpdateTaskDto.create({ name, description });
    if (error) return res.status(400).json({ error });

    this.taskServicePrisma
      .updateTask(updateTaskDto!, req.task!.id)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  };

  deleteTask = (req: Request, res: Response) => {
    this.taskServicePrisma
      .deleteTask(req.project!.id, req.task!.id)
      .then((resp) => res.json(resp))
      .catch((error) => this.handleError(error, res));
  };

  updateTaskStatus = (req: Request, res: Response) => {
    const [error, updateTaskDto] = UpdateTaskDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.taskServicePrisma
      .updateTaskStatus(updateTaskDto!, req.task, req.userPrisma!.id)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  };
}
