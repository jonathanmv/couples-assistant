"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as api from "@/app/todos/todo-api";
import TodoList from "@/app/todos/components/todo-list";

interface Todo {
  id: number;
  text: string;
  author: string;
  label: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const fetchedTodos = await api.getTodos();
      setTodos(fetchedTodos);
      setError(null);
    } catch (err) {
      setError("Failed to fetch todos");
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() !== "" && newAuthor.trim() !== "") {
      try {
        setIsLoading(true);
        const addedTodo = await api.addTodo({
          text: newTodo,
          author: newAuthor,
          label: newLabel,
          completed: false,
        });
        setTodos([...todos, addedTodo]);
        setNewTodo("");
        setNewAuthor("");
        setNewLabel("");
        setError(null);
      } catch (err) {
        setError("Failed to add todo");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeTodo = async (id: number) => {
    try {
      setIsLoading(true);
      await api.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to remove todo");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      setIsLoading(true);
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (todoToUpdate) {
        const updatedTodo = await api.updateTodo({
          ...todoToUpdate,
          completed: !todoToUpdate.completed,
        });
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      }
      setError(null);
    } catch (err) {
      setError("Failed to update todo");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (
    id: number,
    text: string,
    author: string,
    label: string
  ) => {
    setEditingId(id);
    setEditText(text);
    setEditAuthor(author);
    setEditLabel(label);
  };

  const saveEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (todoToUpdate) {
        const updatedTodo = await api.updateTodo({
          ...todoToUpdate,
          text: editText,
          author: editAuthor,
          label: editLabel,
        });
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      }
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError("Failed to update todo");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditAuthor("");
    setEditLabel("");
  };

  if (isLoading && todos.length === 0) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">TODO App</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-col sm:flex-row mb-4 gap-2">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-grow"
        />
        <Input
          type="text"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          placeholder="Author"
          className="sm:w-1/4"
        />
        <Input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label"
          className="sm:w-1/4"
        />
        <Button onClick={addTodo} disabled={isLoading}>
          Add
        </Button>
      </div>
      <TodoList
        todos={todos}
        isLoading={isLoading}
        editingId={editingId}
        editText={editText}
        editAuthor={editAuthor}
        editLabel={editLabel}
        onToggleTodo={toggleTodo}
        onStartEditing={startEditing}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onRemoveTodo={removeTodo}
        onEditTextChange={setEditText}
        onEditAuthorChange={setEditAuthor}
        onEditLabelChange={setEditLabel}
      />
    </div>
  );
}
