"use server";
import { CoreMessage, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface Todo {
  id: number;
  text: string;
  author: string;
  label: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

const fakeTodos: Todo[] = [
  {
    id: 1,
    text: "Learn React",
    author: "Alice",
    label: "Study",
    completed: false,
    createdAt: "2023-06-01T10:00:00Z",
    completedAt: null,
  },
  {
    id: 2,
    text: "Build a TODO app",
    author: "Bob",
    label: "Project",
    completed: true,
    createdAt: "2023-06-02T14:30:00Z",
    completedAt: "2023-06-03T09:15:00Z",
  },
];

export const getTodos = async (): Promise<Todo[]> => {
  return [...fakeTodos];
};

export const addTodo = async (
  todo: Omit<Todo, "id" | "createdAt" | "completedAt">
): Promise<Todo> => {
  const newTodo = {
    ...todo,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  fakeTodos.push(newTodo);
  return newTodo;
};

export const updateTodo = async (todo: Todo): Promise<Todo> => {
  const index = fakeTodos.findIndex((t) => t.id === todo.id);
  if (index !== -1) {
    if (todo.completed && !fakeTodos[index].completed) {
      todo.completedAt = new Date().toISOString();
    } else if (!todo.completed) {
      todo.completedAt = null;
    }
    fakeTodos[index] = todo;
    return todo;
  }
  throw new Error("Todo not found");
};

export const deleteTodo = async (id: number): Promise<void> => {
  const index = fakeTodos.findIndex((t) => t.id === id);
  if (index !== -1) {
    fakeTodos.splice(index, 1);
  } else {
    throw new Error("Todo not found");
  }
};

export const findTodoByText = async (query: string): Promise<Todo | null> => {
  const list = fakeTodos.map((t) => `${t.id}: ${t.text}`).join("\n");
  const history = [
    { role: "assistant", content: list },
    { role: "user", content: query },
  ] as CoreMessage[];
  const { text } = await generateText({
    model: openai("gpt-3.5-turbo"),
    system:
      "Find the id of a todo by its text in the provided list based on what the user says. The id is the number before the colon. Example: '1: Learn React' has id 1. Return only the id of the first match. If no match is found, return null.",
    messages: history,
  });

  if (!text || text.includes("null")) return null;

  const id = parseInt(text);
  if (isNaN(id)) return null;

  return fakeTodos.find((t) => t.id === id) ?? null;
};
