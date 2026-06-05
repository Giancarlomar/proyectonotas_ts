import { Note } from "../note.interface.js";

export type CreateNoteDto = Pick<Note,  "category"  | "title" | "content">;
