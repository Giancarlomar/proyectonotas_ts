import inquirer from "inquirer";
import { DbService } from "./db/db.service.js";
import { NoteCategoryEnum } from "./note/note.enums.js";
import { Note } from "./note/note.interface.js";
import { NoteService } from "./note/note.service.js";
import { NoteCategory } from "./note/note.types.js";

const dbService = new DbService();
const noteService = new NoteService(dbService);

const categories = Object.values(NoteCategoryEnum) as NoteCategory[];

function showNotes(notes: Note[]): void {
  for (const note of notes) {
    console.log(`${note.id} - ${note.title} (${note.category})`);
    console.log(note.content);
    console.log(note.created_at, note.updated_at);
  }
}

async function main(): Promise<void> {
  while (true) {
    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: "select",
        name: "action",
        message: "Menú:",
        choices: [
          "Agregar nota",
          "Ver notas",
          "Buscar nota",
          "Eliminar nota",
          "Salir",
        ],
      },
    ]);

    if (action === "Salir") break;

    if (action === "Agregar nota") {
      const { title, content, category } = await inquirer.prompt<{
        title: string;
        content: string;
        category: NoteCategory;
      }>([
        { type: "input", name: "title", message: "Título:" },
        { type: "input", name: "content", message: "Contenido:" },
        {
          type: "select",
          name: "category",
          message: "Categoría:",
          choices: categories,
        },
      ]);

      try {
        const note = await noteService.add({ title, content, category });
        console.log(`Nota creada: ${note.id} - ${note.title}`);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }

    if (action === "Ver notas") {
      const { filter } = await inquirer.prompt<{ filter: boolean }>([
        {
          type: "confirm",
          name: "filter",
          message: "¿Filtrar por categoría?",
        },
      ]);

      let notes: Note[];

      if (filter) {
        const { category } = await inquirer.prompt<{ category: NoteCategory }>([
          {
            type: "select",
            name: "category",
            message: "Categoría:",
            choices: categories,
          },
        ]);
        notes = await noteService.getAll(category);
      } else {
        notes = await noteService.getAll();
      }

      showNotes(notes);
    }

    if (action === "Buscar nota") {
      const { query } = await inquirer.prompt<{ query: string }>([
        { type: "input", name: "query", message: "Buscar:" },
      ]);

      showNotes(await noteService.search(query));
    }

    if (action === "Eliminar nota") {
      const notes = await noteService.getAll();

      const { id } = await inquirer.prompt<{ id: number }>([
        {
          type: "select",
          name: "id",
          message: "Nota a eliminar:",
          choices: notes.map((note) => ({
            name: note.title,
            value: note.id,
          })),
        },
      ]);

      const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
        { type: "confirm", name: "confirm", message: "¿Eliminar?" },
      ]);

      if (confirm) await noteService.remove(id);
    }
  }
}

main();
