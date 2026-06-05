import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Note } from "../note/note.interface.js";
import { NoteCategory } from "../note/note.types.js";

const JsonPath = join(process.cwd(), "data.json");

interface SerializedNote {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  created_at: string;
  updated_at: string;
}

interface DbSchema {
  notes: SerializedNote[];
}

export class DbService {
  async load(): Promise<Note[]> {
    const content = await readFile(JsonPath, "utf-8");
    const data: DbSchema = JSON.parse(content);

    return data.notes.map((note) => ({
      ...note,
      created_at: new Date(note.created_at),
      updated_at: new Date(note.updated_at),
    }));
  }

  async save(notes: Note[]): Promise<void> {
    const serialized: SerializedNote[] = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      created_at: note.created_at.toString(),
      updated_at: note.updated_at.toString(),
    }));

    const data: DbSchema = { notes: serialized };
    await writeFile(JsonPath, JSON.stringify(data, null, 2), "utf-8");
  }
}
