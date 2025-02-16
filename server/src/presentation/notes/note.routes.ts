import { Router } from "express";
import { NoteService } from "../services/note.service";
import { NoteController } from "./note.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ValidateProjectMiddleware } from "../middlewares/validate-project-exists.middleware";
import { ValidateTaskMiddleware } from "../middlewares/validate-task.middleware";

export class NoteRoutes {
  static get routes(): Router {
    const router = Router();
    const noteService = new NoteService();
    const controller = new NoteController(noteService);

    router.use(AuthMiddleware.validateJWT)
    router.param('projectId', ValidateProjectMiddleware.validateProjectExists);
    router.param('taskId', ValidateTaskMiddleware.validateTaskExists);
    router.param('taskId', ValidateTaskMiddleware.taskBelongsToProject);

    router.post("/project/:projectId/task/:taskId", controller.createNote);
    router.get("/project/:projectId/task/:taskId", controller.getNotesByTask);
    router.delete("/:noteId/project/:projectId/task/:taskId", controller.deleteNoteById);

    return router;
  }
}
