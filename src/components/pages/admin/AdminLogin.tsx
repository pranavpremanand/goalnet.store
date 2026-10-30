"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuArrowLeft as ArrowLeft, LuEye as Eye, LuEyeOff as EyeOff } from "react-icons/lu";
import { ApiError, signInAdmin } from "@/lib/auth-client";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";

const inputClass = "mt-2 w-full border border-line p-3 text-sm outline-none focus:border-ink aria-invalid:border-red-600";

export function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignInInput>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: SignInInput) {
    try {
      await signInAdmin(values);
      router.push("/admin");
    } catch (error) {
      setError("root.server", { message: error instanceof ApiError ? error.message : "Something went wrong. Please try again." });
    }
  }

  return (
    <main className="grid min-h-[100svh] lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <Link className="inline-flex items-center gap-2 text-xs font-bold uppercase text-muted" href="/"><ArrowLeft size={15} /> Back to store</Link>
          <p className="mt-12 text-xs font-bold uppercase text-muted">GoalNet / Workspace</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Admin sign in</h1>
          <p className="mt-3 text-sm text-muted">Manage your store, catalog, and order flow.</p>
          <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.server && <p className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{errors.root.server.message}</p>}
            <label className="block text-xs font-semibold">Email<input {...register("email")} aria-invalid={Boolean(errors.email)} autoComplete="email" className={inputClass} placeholder="admin@example.com" type="email" />{errors.email && <span className="mt-1.5 block text-xs text-red-700" role="alert">{errors.email.message}</span>}</label>
            <label className="block text-xs font-semibold">Password
              <div aria-invalid={Boolean(errors.password)} className="mt-2 flex border border-line focus-within:border-ink aria-invalid:border-red-600">
                <input {...register("password")} autoComplete="current-password" className="min-w-0 flex-1 p-3 text-sm outline-none" placeholder="Enter password" type={showPassword ? "text" : "password"} />
                <button aria-label={showPassword ? "Hide password" : "Show password"} className="px-3 text-muted" onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
              {errors.password && <span className="mt-1.5 block text-xs text-red-700" role="alert">{errors.password.message}</span>}
            </label>
            <button className="min-h-12 w-full bg-brand text-xs font-bold uppercase disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Please wait…" : "Sign in"}</button>
          </form>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-charcoal lg:block"><Image alt="Football stadium before kickoff" className="object-cover" fill priority sizes="50vw" src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=85" /><div className="absolute inset-0 bg-black/45" /><div className="absolute bottom-12 left-12 max-w-lg text-white"><p className="text-xs font-bold uppercase text-brand">Behind every great matchday</p><h2 className="mt-3 font-display text-4xl font-semibold">The details that keep the game moving.</h2></div></aside>
    </main>
  );
}
