"use server";

import { Weather } from "@/components/weather";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableUI } from "ai/rsc";
import { ReactNode } from "react";
import { z } from "zod";
import * as todoApi from "@/app/actions-todo";
import { TodoListPreview } from "@/components/todo-list-preview";

type StreamableUIWrapper = ReturnType<typeof createStreamableUI>;

const getWeatherTool = (stream: StreamableUIWrapper) => ({
  showWeather: {
    description: "Show the weather for a given location.",
    parameters: z.object({
      city: z.string().describe("The city to show the weather for."),
      unit: z.enum(["F"]).describe("The unit to display the temperature in"),
    }),
    execute: async ({ city, unit }: Parameters<typeof Weather>[0]) => {
      stream.done(<Weather city={city} unit={unit} />);
      return `Here's the weather for ${city}!`;
    },
  },
});

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

export interface Message {
  role: "user" | "assistant";
  content: string;
  display?: ReactNode;
}

export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text, toolResults } = await generateText({
    model: openai("gpt-3.5-turbo"),
    system: "You are a friendly assistant!",
    messages: history,
    tools: {
      ...getWeatherTool(stream),
      // TODO tools
      ...getTodosTool(stream),
      ...getAddTodoTool(stream),
      ...getCompleteTodoTool(stream),
      ...getRemoveCompletedTodosTool(stream),
    },
  });

  return {
    messages: [
      ...history,
      {
        role: "assistant" as const,
        content:
          text || toolResults.map((toolResult) => toolResult.result).join(),
        display: stream.value,
      },
    ],
  };
}
