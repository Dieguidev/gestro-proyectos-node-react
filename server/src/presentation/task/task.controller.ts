import { Request, Response } from "express";
import { CreateTaskDto, CustomError, GetTaskByIdDto, GetTasksByProjectIdDto, UpdateTaskDto } from "../../domain";
import { TaskService } from "../services/task.service";

export class TaskController {

  constructor(
    private readonly taskService: TaskService
  ) { }

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }

    console.log(`${error}`);

    return res.status(500).json({ error: 'Internal Server Error' })
  }


  createTask = (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { name, description } = req.body
    const [error, createTaskDto] = CreateTaskDto.create({ name, description, projectId })
    if (error) return res.status(400).json({ error })

    this.taskService.createTask(createTaskDto!, req.project)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  }

  getTasksByProjectId = (req: Request, res: Response) => {

    this.taskService.getTasksByProjectId(req.project)
      .then((tasks) => res.json(tasks))
      .catch((error) => this.handleError(error, res));
  }

  getTaskById = (req: Request, res: Response) => {
    this.taskService.getTaskById(req.task)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  }

  updateTask = (req: Request, res: Response) => {
    const { name, description } = req.body;

    const [error, updateTaskDto] = UpdateTaskDto.create({ name, description })
    if (error) return res.status(400).json({ error })

    this.taskService.updateTask(updateTaskDto!, req.task)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  }

  deleteTask = (req: Request, res: Response) => {
    this.taskService.deleteTask( req.project, req.task)
      .then(() => res.json({ message: 'Task deleted' }))
      .catch((error) => this.handleError(error, res));
  }

  updateTaskStatus = (req: Request, res: Response) => {
    const [error, updateTaskDto] = UpdateTaskDto.create(req.body)
    if (error) return res.status(400).json({ error })

    this.taskService.updateTaskStatus(updateTaskDto!, req.task, req.user)
      .then((task) => res.json(task))
      .catch((error) => this.handleError(error, res));
  }
}
