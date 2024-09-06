import { createStreamableUI } from "ai/rsc";
import { TodoListPreview } from "@/components/todo-list-preview";
import * as todoApi from "@/app/todos/todo-api";
import { z } from "zod";

type StreamableUIWrapper = ReturnType<typeof createStreamableUI>;

const getTodosTool = (stream: StreamableUIWrapper) => ({
  showTodos: {
    description: "Show the list of todos.",
    parameters: z.object({}),
    execute: async () => {
      const todos = await todoApi.getTodos();
      stream.done(<TodoListPreview todos={todos} />);
      return "Here are your todos:";
    },
  },
});

const getAddTodoTool = (stream: StreamableUIWrapper) => ({
  addTodo: {
    description: "Add a new todo.",
    parameters: z.object({
      text: z.string().describe("The text of the todo."),
      author: z.string().describe("The author of the todo."),
      label: z.string().optional().describe("The label of the todo."),
    }),
    execute: async ({
      text,
      author,
      label,
    }: Parameters<typeof todoApi.addTodo>[0]) => {
      const newTodo = await todoApi.addTodo({
        text,
        author,
        label,
        completed: false,
      });
      stream.done(<TodoListPreview todos={[newTodo]} />);
      return "TODO added!";
    },
  },
});

const getCompleteTodoTool = (stream: StreamableUIWrapper) => ({
  completeTodo: {
    description: "Complete a todo.",
    parameters: z.object({ text: z.string().describe("The text of the todo") }),
    execute: async ({ text }: { text: string }) => {
      let todo = await todoApi.findTodoByText(text);
      if (!todo) {
        return "I couldn't find a todo similar to " + text;
      }

      todo = await todoApi.updateTodo({
        ...todo,
        completed: true,
      });
      stream.done(<TodoListPreview todos={[todo]} />);
      return "TODO completed!";
    },
  },
});

const getRemoveCompletedTodosTool = (stream: StreamableUIWrapper) => ({
  removeCompletedTodos: {
    description: "Remove all completed todos.",
    parameters: z.object({}),
    execute: async () => {
      const todos = await todoApi.getTodos();
      const completedTodos = todos.filter((todo) => todo.completed);
      await Promise.all(
        completedTodos.map((todo) => todoApi.deleteTodo(todo.id))
      );
      const leftTodos = await todoApi.getTodos();
      stream.done(<TodoListPreview todos={leftTodos} />);
      return "Completed todos removed! Here are the remaining todos:";
    },
  },
});

export const buildTodoTools = (stream: StreamableUIWrapper) => ({
  ...getTodosTool(stream),
  ...getAddTodoTool(stream),
  ...getCompleteTodoTool(stream),
  ...getRemoveCompletedTodosTool(stream),
});
