"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type FieldValues, type Path, type UseFormRegisterReturn, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuArrowLeft as ArrowLeft, LuEye as Eye, LuEyeOff as EyeOff, LuMail as Mail, LuPhone as Phone, LuCheck as Check } from "react-icons/lu";
import { useLocalCart } from "@/components/common/LocalCartProvider";
import { ApiError, signInUser, signUpUser } from "@/lib/auth-client";
import { forgotPasswordSchema, signInSchema, signUpSchema, type ForgotPasswordInput, type SignInInput, type SignUpInput } from "@/lib/validation/auth";

type AuthMode = "login" | "signup" | "forgot-password";

const copy: Record<AuthMode, { eyebrow: string; title: string; description: string; action: string }> = {
  login: { eyebrow: "Welcome back", title: "Good to see you again.", description: "Sign in to see your orders, favorites, and the jerseys you have your eye on.", action: "Log in" },
  signup: { eyebrow: "Join the club", title: "Your next chapter starts here.", description: "Create an account for a better way to keep your colors close.", action: "Create account" },
  "forgot-password": { eyebrow: "Account help", title: "Let’s get you back in.", description: "Enter your email and we’ll show a local confirmation for the reset request.", action: "Continue" },
};

const inputClass = "mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink aria-invalid:border-red-600";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-red-700" role="alert">{message}</p> : null;
}

function PasswordField({ autoComplete, error, registration }: { autoComplete: string; error?: string; registration: UseFormRegisterReturn }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block text-xs font-semibold">Password
      <div aria-invalid={Boolean(error)} className="mt-2 flex border border-line focus-within:border-ink aria-invalid:border-red-600">
        <input {...registration} aria-invalid={Boolean(error)} autoComplete={autoComplete} className="min-w-0 flex-1 px-4 py-3 text-sm outline-none" placeholder="Enter your password" type={visible ? "text" : "password"} />
        <button aria-label={visible ? "Hide password" : "Show password"} className="px-3 text-muted" onClick={() => setVisible(!visible)} type="button">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
      </div>
      <FieldError message={error} />
    </label>
  );
}

// Server-side rejections are surfaced on the matching field, or as a form-level message.
function showApiError<Values extends FieldValues>(error: unknown, setError: UseFormSetError<Values>) {
  if (!(error instanceof ApiError)) {
    setError("root.server", { message: "Something went wrong. Please try again." });
    return;
  }
  const fieldEntries = Object.entries(error.fieldErrors ?? {}).filter(([, messages]) => messages.length > 0);
  if (error.status === 409 || error.status === 400) {
    fieldEntries.forEach(([field, messages]) => setError(field as Path<Values>, { type: "server", message: messages[0] }));
  }
  if (!fieldEntries.length) setError("root.server", { message: error.message });
}

function useAfterAuth(redirectTo?: string) {
  const router = useRouter();
  const { itemCount } = useLocalCart();
  return () => router.push(redirectTo ?? (itemCount > 0 ? "/checkout" : "/dashboard/dashboard"));
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return <button className="min-h-12 w-full bg-brand text-sm font-bold uppercase transition hover:bg-[#d8df0d] disabled:opacity-60" disabled={busy} type="submit">{busy ? "Please wait…" : label}</button>;
}

function ServerMessage({ message }: { message?: string }) {
  return message ? <p className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{message}</p> : null;
}

function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const afterAuth = useAfterAuth(redirectTo);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignInInput>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: SignInInput) {
    try {
      await signInUser(values);
      afterAuth();
    } catch (error) {
      showApiError(error, setError);
    }
  }

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <ServerMessage message={errors.root?.server?.message} />
      <label className="block text-xs font-semibold">Email address<input {...register("email")} aria-invalid={Boolean(errors.email)} autoComplete="email" className={inputClass} placeholder="you@example.com" type="email" /><FieldError message={errors.email?.message} /></label>
      <PasswordField autoComplete="current-password" error={errors.password?.message} registration={register("password")} />
      <div className="flex justify-end text-xs"><Link className="font-semibold text-ink underline underline-offset-4" href="/forgot-password">Forgot password?</Link></div>
      <SubmitButton busy={isSubmitting} label={copy.login.action} />
    </form>
  );
}

function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const afterAuth = useAfterAuth(redirectTo);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema), defaultValues: { name: "", email: "", password: "", acceptTerms: false } });

  async function onSubmit(values: SignUpInput) {
    try {
      await signUpUser(values);
      afterAuth();
    } catch (error) {
      showApiError(error, setError);
    }
  }

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <ServerMessage message={errors.root?.server?.message} />
      <label className="block text-xs font-semibold">Full name<input {...register("name")} aria-invalid={Boolean(errors.name)} autoComplete="name" className={inputClass} placeholder="Enter your name" /><FieldError message={errors.name?.message} /></label>
      <label className="block text-xs font-semibold">Email address<input {...register("email")} aria-invalid={Boolean(errors.email)} autoComplete="email" className={inputClass} placeholder="you@example.com" type="email" /><FieldError message={errors.email?.message} /></label>
      <div>
        <PasswordField autoComplete="new-password" error={errors.password?.message} registration={register("password")} />
        {!errors.password && <p className="mt-1.5 text-[11px] text-muted">At least 8 characters. Choose anything you like, just avoid easy-to-guess ones like 12345678.</p>}
      </div>
      <div>
        <label className="flex items-start gap-2 text-xs text-muted"><input {...register("acceptTerms")} className="mt-0.5 size-4 accent-[#f2fa18]" type="checkbox" />I agree to the terms and privacy policy.</label>
        <FieldError message={errors.acceptTerms?.message} />
      </div>
      <SubmitButton busy={isSubmitting} label={copy.signup.action} />
    </form>
  );
}

function ForgotPasswordForm({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(onDone)}>
      <label className="block text-xs font-semibold">Email address
        <div aria-invalid={Boolean(errors.email)} className="mt-2 flex items-center gap-3 border border-line px-4 focus-within:border-ink aria-invalid:border-red-600"><Mail className="text-muted" size={17} /><input {...register("email")} autoComplete="email" className="min-w-0 flex-1 py-3 text-sm outline-none" placeholder="you@example.com" type="email" /></div>
        <FieldError message={errors.email?.message} />
      </label>
      <SubmitButton busy={false} label={copy["forgot-password"].action} />
    </form>
  );
}

export function AuthPage({ mode, redirectTo }: { mode: AuthMode; redirectTo?: string }) {
  const [resetRequested, setResetRequested] = useState(false);
  const content = copy[mode];
  const otherAuthHref = `${mode === "login" ? "/signup" : "/login"}${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`;

  return (
    <main className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[470px]">
          <Link className="inline-flex items-center gap-2 text-xs font-bold uppercase text-muted hover:text-ink" href={mode === "forgot-password" ? "/login" : "/"}><ArrowLeft size={15} /> {mode === "forgot-password" ? "Back to log in" : "Back to GoalNet"}</Link>
          {resetRequested ? (
            <div aria-live="polite" className="mt-12 border-l-4 border-brand bg-canvas p-6 sm:p-8"><span className="grid size-11 place-items-center bg-brand"><Check size={21} /></span><p className="mt-5 text-xs font-bold uppercase text-muted">Local demo state</p><h1 className="mt-2 font-display text-3xl font-semibold">Reset request ready.</h1><p className="mt-3 font-copy text-sm leading-6 text-muted">Password reset emails are not connected yet. Your request was accepted for demonstration.</p><button className="mt-6 bg-ink px-5 py-3 text-xs font-bold uppercase text-white" onClick={() => setResetRequested(false)} type="button">Back to form</button></div>
          ) : (
            <>
              <p className="mt-10 text-xs font-bold uppercase text-muted">{content.eyebrow}</p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">{content.title}</h1>
              <p className="mt-4 max-w-md font-copy text-sm leading-7 text-muted">{content.description}</p>
              {mode === "login" && <SignInForm redirectTo={redirectTo} />}
              {mode === "signup" && <SignUpForm redirectTo={redirectTo} />}
              {mode === "forgot-password" && <ForgotPasswordForm onDone={() => setResetRequested(true)} />}
              {mode !== "forgot-password" && <p className="mt-7 text-center text-sm text-muted">{mode === "login" ? "New to GoalNet?" : "Already part of the club?"} <Link className="ml-1 font-bold text-ink underline underline-offset-4" href={otherAuthHref}>{mode === "login" ? "Create account" : "Log in"}</Link></p>}
              {mode === "forgot-password" && <p className="mt-6 flex items-center gap-2 text-xs text-muted"><Phone size={14} /> Need help? Contact our support team.</p>}
            </>
          )}
        </div>
      </section>
      <aside className="relative hidden min-h-full overflow-hidden bg-charcoal lg:block">
        <Image alt="Football stadium ready for kickoff" className="object-cover" fill priority sizes="50vw" src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
        <div className="absolute bottom-12 left-10 right-10 text-white xl:bottom-16 xl:left-14"><p className="text-xs font-bold uppercase text-brand">For every side of the game</p><p className="mt-3 max-w-lg font-display text-4xl font-semibold leading-tight xl:text-5xl">The stories we wear are the stories we keep.</p></div>
      </aside>
    </main>
  );
}
