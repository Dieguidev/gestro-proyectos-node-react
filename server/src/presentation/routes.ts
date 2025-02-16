import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";
import { ProjectRoutes } from "./project/project.routes";
import { TaskRoutes } from "./task/task.routes";
import { NoteRoutes } from "./notes/note.routes";



export class AppRoutes {


  static get routes():Router {
    const router = Router();
    router.use('/api/auth', AuthRoutes.routes)
    router.use('/api/project', ProjectRoutes.routes)
    router.use('/api/task', TaskRoutes.routes)
    router.use('/api/note', NoteRoutes.routes)
    return router;
  }
}
