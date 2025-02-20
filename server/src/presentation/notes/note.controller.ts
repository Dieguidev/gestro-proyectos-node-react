import { Request, Response } from 'express';
import { CreateNoteDto, CustomError } from '../../domain';
import { NoteService } from '../services/note.service';
import { Types } from 'mongoose';
import { NoteServicePrisma } from '../services/note.service-prisma';

export type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  constructor(
    private readonly noteServicePrisma: NoteServicePrisma
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);

    return res.status(500).json({ error: 'Internal Server Error' });
  };

  createNote = (req: Request, res: Response) => {
    const [error, createNoteDto] = CreateNoteDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.noteServicePrisma
      .createNote(createNoteDto!, req.task!.id, req.userPrisma!.id)
      .then((note) => res.json(note))
      .catch((error) => this.handleError(error, res));
  };

  getNotesByTask = (req: Request, res: Response) => {
    this.noteServicePrisma
      .getNotesByTask(req.task!.id)
      .then((notes) => res.json(notes))
      .catch((error) => this.handleError(error, res));
  };

  deleteNoteById = (req: Request, res: Response) => {
    const { noteId } = req.params;
    console.log(req.params);
    this.noteServicePrisma
      .deleteNoteById(noteId, req.userPrisma!.id)
      .then((response) => res.json(response))
      .catch((error) => this.handleError(error, res));
  };
}
