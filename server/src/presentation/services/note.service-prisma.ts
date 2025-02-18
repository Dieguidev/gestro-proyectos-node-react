import { startSession } from 'mongoose';
import { NoteModel } from '../../data/mongodb/models/notes.model';
import { CreateNoteDto, CustomError } from '../../domain';
import { NoteParams } from '../notes/note.controller';
import { prisma } from '../../data/prisma/prisma-db';
import { Note, Task, User } from '@prisma/client';
import { Validators } from '../../config';

export class NoteServicePrisma {
  async createNote(
    createNoteDto: CreateNoteDto,
    taskId: Task['id'],
    userId: User['id']
  ) {
    const { content } = createNoteDto;

    try {
      await prisma.note.create({
        data: {
          content,
          userId,
          taskId,
        },
      });

      return 'Nota Creada Correctamente';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);
      throw CustomError.internalServer();
    }
  }

  async getNotesByTask(taskId: Task['id']) {
    try {
      const notes = await prisma.note.findMany({
        where: {
          taskId,
        },
      });
      return notes;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);
      throw CustomError.internalServer();
    }
  }

  async deleteNoteById(noteId: Note['id'], userId: User['id']) {
    console.log(noteId);
    try {
      //TODO: Implementar un middleware para validar el id de la nota y su existencia
      if(!Validators.isUUID(noteId)) {
        throw CustomError.badRequest('El id de la nota no es válido');
      }
      console.log('aqui');

      const note = await prisma.note.findUnique({
        where: {
          id: noteId,
        },
      });
      if (!note) {
        throw CustomError.notFound('Nota no encontrada');
      }

      if (note.userId !== userId) {
        throw CustomError.unauthorized('Acción no válida');
      }

      await prisma.note.delete({
        where: {
          id: noteId,
        },
      });

      return 'Nota eliminada correctamente';
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.log(`${error}`);
      throw CustomError.internalServer();
    }
  }
}
