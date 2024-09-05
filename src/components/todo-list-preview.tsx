import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface Todo {
  id: number;
  text: string;
  author: string;
  label: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

interface TodoListProps {
  todos: Todo[];
}

export function TodoListPreview({ todos }: TodoListProps) {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li key={todo.id} className="flex flex-col bg-gray-100 p-2 rounded">
          <div className="flex items-center mb-2">
            <label
              className={`flex-grow ${
                todo.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {todo.text}
            </label>
            {todo.label && (
              <Badge variant="secondary" className="ml-2">
                <Tag className="h-3 w-3 mr-1" />
                {todo.label}
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-2">
            <div className="flex items-center mr-4">
              <span>{todo.author}</span>
            </div>
            <div className="flex items-center">
              <span>Created: {formatDate(todo.createdAt)}</span>
            </div>
            {todo.completed && todo.completedAt && (
              <div className="flex items-center sm:ml-4">
                <span>Completed: {formatDate(todo.completedAt)}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
