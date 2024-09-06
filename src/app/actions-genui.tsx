"use server";

import { Weather } from "@/components/weather";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableUI } from "ai/rsc";
import { ReactNode } from "react";
import { z } from "zod";
import { buildTodoTools } from "@/app/todos/todo-tools";

type StreamableUIWrapper = ReturnType<typeof createStreamableUI>;

const getNoToolFoundTool = (stream: StreamableUIWrapper) => ({
  noToolFound: {
    description:
      "Use this tool when you can't help the user with the task you were asked to do.",
    parameters: z.object({
      message: z.string().describe("The message to display."),
    }),
    execute: async ({ message }: { message: string }) => {
      stream.done();
      return message;
    },
  },
});

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
      ...buildTodoTools(stream),
      ...getNoToolFoundTool(stream),
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
