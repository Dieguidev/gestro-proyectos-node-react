import { Request, Response } from "express";
import { CreateNoteDto, CustomError } from "../../domain";
import { NoteService } from "../services/note.service";
import { INote } from '../../data/mongodb/models/notes.model';
import { Types } from "mongoose";

export type NoteParams = {
  noteId: Types.ObjectId
}

export class NoteController {
  constructor(
    private readonly noteService: NoteService
  ) { }

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }

    console.log(`${error}`);

    return res.status(500).json({ error: 'Internal Server Error' })
  }

  createNote = (req: Request<{}, {}, INote>, res: Response) => {
    const [error, createNoteDto] = CreateNoteDto.create(req.body)
    if (error) return res.status(400).json({ error })

    this.noteService.createNote(createNoteDto!, req.task!, req.user!)
      .then(note => res.json(note))
      .catch(error => this.handleError(error, res));
  }

  getNotesByTask = (req: Request, res: Response) => {
    this.noteService.getNotesByTask(req.task!)
      .then(notes => res.json(notes))
      .catch(error => this.handleError(error, res));
  }

  deleteNoteById = (req: Request<NoteParams>, res: Response) => {
    const { noteId } = req.params
    this.noteService.deleteNoteById(noteId, req.user!, req.task!)
      .then((response) => res.json(response))
      .catch(error => this.handleError(error, res));
  }
}
