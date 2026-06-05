import { NoteCategory } from "./note.types.js";

export interface Note {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  created_at: Date;
  updated_at: Date;
}
