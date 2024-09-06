import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X, User, Calendar, Tag } from "lucide-react";

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
  isLoading: boolean;
  editingId: number | null;
  editText: string;
  editAuthor: string;
  editLabel: string;
  onToggleTodo: (id: number) => void;
  onStartEditing: (
    id: number,
    text: string,
    author: string,
    label: string
  ) => void;
  onSaveEdit: (id: number) => void;
  onCancelEdit: () => void;
  onRemoveTodo: (id: number) => void;
  onEditTextChange: (value: string) => void;
  onEditAuthorChange: (value: string) => void;
  onEditLabelChange: (value: string) => void;
}

export default function TodoList({
  todos,
  isLoading,
  editingId,
  editText,
  editAuthor,
  editLabel,
  onToggleTodo,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onRemoveTodo,
  onEditTextChange,
  onEditAuthorChange,
  onEditLabelChange,
}: TodoListProps) {
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
          {editingId === todo.id ? (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <Input
                  type="text"
                  value={editText}
                  onChange={(e) => onEditTextChange(e.target.value)}
                  className="flex-grow"
                />
                <Input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => onEditAuthorChange(e.target.value)}
                  className="sm:w-1/4"
                />
                <Input
                  type="text"
                  value={editLabel}
                  onChange={(e) => onEditLabelChange(e.target.value)}
                  className="sm:w-1/4"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => onSaveEdit(todo.id)}
                  className="mr-2"
                  size="sm"
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button
                  onClick={onCancelEdit}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-2">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => onToggleTodo(todo.id)}
                  id={`todo-${todo.id}`}
                  className="mr-2"
                  disabled={isLoading}
                />
                <label
                  htmlFor={`todo-${todo.id}`}
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
                  <User className="h-4 w-4 mr-1" />
                  <span>{todo.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created: {formatDate(todo.createdAt)}</span>
                </div>
                {todo.completed && todo.completedAt && (
                  <div className="flex items-center sm:ml-4">
                    <Check className="h-4 w-4 mr-1" />
                    <span>Completed: {formatDate(todo.completedAt)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    onStartEditing(todo.id, todo.text, todo.author, todo.label)
                  }
                  className="mr-2"
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  onClick={() => onRemoveTodo(todo.id)}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
