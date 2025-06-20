"use client";
import { supabase } from "@/lib/supabase";
import { todoSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Todo = {
  id: number;
  title: string;
  created_at: string;
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof todoSchema>>({
    resolver: zodResolver(todoSchema),
  });

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setTodos(
        data
          .filter((t) => t.title !== null)
          .map((t) => ({
            id: Number(t.id),
            title: t.title as string,
            created_at: t.created_at,
          }))
      );
    }
  };

  const onSubmit = async (data: z.infer<typeof todoSchema>) => {
    // 1. Foydalanuvchini olish
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Foydalanuvchi aniqlanmadi");
      return;
    }

    // 2. user_id bilan insert qilish
    const { error } = await supabase.from("todos").insert({
      title: data.title,
      user_id: user?.id, // 👈 MUHIM QISM
    });

    if (!error) {
      reset();
      fetchTodos();
    } else {
      alert(error.message);
    }
  };

  const deleteTodo = async (id: number) => {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos();
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-4">
        <input
          {...register("title")}
          placeholder="Yangi todo..."
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Qo‘shish
        </button>
      </form>
      {errors.title && (
        <p className="text-red-500 mb-2">{errors.title.message}</p>
      )}

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex justify-between border p-2">
            <span>{todo.title}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500"
            >
              🗑
            </button>
            <span>{todo.created_at}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
