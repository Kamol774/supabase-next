"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (!error) {
      alert("Ro‘yxatdan o‘tish muvaffaqiyatli! Endi login qiling.");
      router.push("/login");
    } else {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Email" {...register("email")} />
      <input type="password" placeholder="Parol" {...register("password")} />
      <button type="submit">Ro‘yxatdan o‘tish</button>
    </form>
  );
}
