import { DbService } from "../db/db.service.js";
import { CreateNoteDto } from "./dtos/create-note.dto.js";
import { Note } from "./note.interface.js";
import { NoteCategory } from "./note.types.js";

export class NoteService {
  constructor(private readonly dbService: DbService) {
    this.dbService = dbService;
  }

  async add(data: CreateNoteDto): Promise<Note> {
    const notes = await this.dbService.load();

    const existingNote = notes.find((note) => note.title === data.title);

    if (existingNote) {
      throw new Error(`Ya existe una nota  "${data.title}"`);
    }

    let maxId = 0;

    for (const note of notes) {
      if (note.id > maxId) {
        maxId = note.id;
      }
    }
    const now = new Date();

    const newNote: Note = {
      id: maxId + 1,
      title: data.title,
      content: data.content,
      category: data.category,
      created_at: now,
      updated_at: now,
    };

    notes.push(newNote);
    await this.dbService.save(notes);

    return newNote;
  }

  async getAll(category?: NoteCategory): Promise<Note[]> {
    const notes = await this.dbService.load();

    if (category) {
      return notes.filter((note) => note.category === category);
    }

    return notes;
  }

  async getById(id: number): Promise<Note> {
    const notes = await this.dbService.load();
    const note = notes.find((n) => n.id === id);

    if (!note) {
      throw new Error(`Nota con id ${id} no encontrada`);
    }

    return note;
  }

  async search(query: string): Promise<Note[]> {
    const notes = await this.dbService.load();

    return notes.filter(
      (note) =>
        note.title.includes(query) || note.content.includes(query)
    );
  }

  async remove(id: number): Promise<boolean> {
    const notes = await this.dbService.load();
    const initialLength = notes.length;
    const filtered = notes.filter((note) => note.id !== id);

    if (filtered.length === initialLength) {
      return false;
    }

    await this.dbService.save(filtered);
    return true;
  }
}
