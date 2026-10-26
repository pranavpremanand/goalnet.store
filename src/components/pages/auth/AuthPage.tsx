"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Phone, Check } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot-password";

const copy: Record<AuthMode, { eyebrow: string; title: string; description: string; action: string }> = {
  login: { eyebrow: "Welcome back", title: "Good to see you again.", description: "Sign in to see your orders, favorites, and the jerseys you have your eye on.", action: "Log in" },
  signup: { eyebrow: "Join the club", title: "Your next chapter starts here.", description: "Create an account for a better way to keep your colors close.", action: "Create account" },
  "forgot-password": { eyebrow: "Account help", title: "Let’s get you back in.", description: "Enter your email and we’ll show a local confirmation for the reset request.", action: "Continue" },
};

export function AuthPage({ mode }: { mode: AuthMode }) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const content = copy[mode];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[470px]">
          <Link className="inline-flex items-center gap-2 text-xs font-bold uppercase text-muted hover:text-ink" href={mode === "forgot-password" ? "/login" : "/"}><ArrowLeft size={15} /> {mode === "forgot-password" ? "Back to log in" : "Back to GoalNet"}</Link>
          {submitted ? (
            <div aria-live="polite" className="mt-12 border-l-4 border-brand bg-canvas p-6 sm:p-8"><span className="grid size-11 place-items-center bg-brand"><Check size={21} /></span><p className="mt-5 text-xs font-bold uppercase text-muted">Local demo state</p><h1 className="mt-2 font-display text-3xl font-semibold">{mode === "forgot-password" ? "Reset request ready." : "You’re all set."}</h1><p className="mt-3 font-copy text-sm leading-6 text-muted">This UI is not connected to an account service yet. Your form was accepted for demonstration.</p><button className="mt-6 bg-ink px-5 py-3 text-xs font-bold uppercase text-white" onClick={() => setSubmitted(false)} type="button">Back to form</button></div>
          ) : (
            <>
              <p className="mt-10 text-xs font-bold uppercase text-muted">{content.eyebrow}</p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">{content.title}</h1>
              <p className="mt-4 max-w-md font-copy text-sm leading-7 text-muted">{content.description}</p>
              <form className="mt-8 space-y-5" onSubmit={submit}>
                {mode === "signup" && <label className="block text-xs font-semibold">Full name<input autoComplete="name" className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink" name="name" placeholder="Enter your name" required /></label>}
                {mode === "forgot-password" ? <label className="block text-xs font-semibold">Email address<div className="mt-2 flex items-center gap-3 border border-line px-4 focus-within:border-ink"><Mail className="text-muted" size={17} /><input autoComplete="email" className="min-w-0 flex-1 py-3 text-sm outline-none" name="email" placeholder="you@example.com" required type="email" /></div></label> : <label className="block text-xs font-semibold">Email address<input autoComplete="email" className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink" name="email" placeholder="you@example.com" required type="email" /></label>}
                {mode !== "forgot-password" && <label className="block text-xs font-semibold">Password<div className="mt-2 flex border border-line focus-within:border-ink"><input autoComplete={mode === "signup" ? "new-password" : "current-password"} className="min-w-0 flex-1 px-4 py-3 text-sm outline-none" minLength={6} name="password" placeholder="Enter your password" required type={showPassword ? "text" : "password"} /><button aria-label={showPassword ? "Hide password" : "Show password"} className="px-3 text-muted" onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
                {mode === "signup" && <label className="flex items-start gap-2 text-xs text-muted"><input className="mt-0.5 size-4 accent-[#f2fa18]" required type="checkbox" />I agree to the terms and privacy policy.</label>}
                {mode === "login" && <div className="flex items-center justify-between gap-3 text-xs"><label className="flex items-center gap-2 text-muted"><input className="size-4 accent-[#f2fa18]" type="checkbox" />Remember me</label><Link className="font-semibold text-ink underline underline-offset-4" href="/forgot-password">Forgot password?</Link></div>}
                <button className="min-h-12 w-full bg-brand text-sm font-bold uppercase transition hover:bg-[#d8df0d]" type="submit">{content.action}</button>
              </form>
              {mode !== "forgot-password" && <><div className="my-6 flex items-center gap-4 text-[10px] font-semibold uppercase text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div><button className="min-h-12 w-full border border-line text-sm font-semibold transition hover:border-ink" onClick={() => setSubmitted(true)} type="button">Continue with Google <span className="ml-2 font-bold text-[#4285f4]">G</span></button><p className="mt-7 text-center text-sm text-muted">{mode === "login" ? "New to GoalNet?" : "Already part of the club?"} <Link className="ml-1 font-bold text-ink underline underline-offset-4" href={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Create account" : "Log in"}</Link></p></>}
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