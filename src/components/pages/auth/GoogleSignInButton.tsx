"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { signInWithGoogle } from "@/lib/auth-client";

type GoogleCredentialResponse = { credential?: string };
type GoogleButtonOptions = { type: "standard"; theme: "outline"; size: "large"; text: "continue_with"; shape: "rectangular"; logo_alignment: "left"; width: number };
type GoogleCredentialHandler = (response: GoogleCredentialResponse) => Promise<void>;

declare global {
  interface Window {
    __goalnetGoogleClientId?: string;
    __goalnetGoogleCredentialHandler?: GoogleCredentialHandler;
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = { clientId: string; acceptTerms?: boolean; signupHref?: string; onSuccess: () => void };

export function GoogleSignInButton({ clientId, acceptTerms = false, signupHref = "/signup", onSuccess }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const successRef = useRef(onSuccess);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsSignup, setNeedsSignup] = useState(false);

  useEffect(() => {
    successRef.current = onSuccess;
  }, [onSuccess]);

  function initialize() {
    const google = window.google;
    const target = buttonRef.current;
    if (!clientId || !google || !target) return;

    window.__goalnetGoogleCredentialHandler = async ({ credential }) => {
        if (!credential) {
          setError("Google did not return a sign-in credential. Please try again.");
          return;
        }
        setBusy(true);
        setError("");
        setNeedsSignup(false);
        try {
          await signInWithGoogle(credential, acceptTerms);
          successRef.current();
        } catch (failure) {
          const apiFailure = failure instanceof ApiError ? failure : null;
          setError(apiFailure?.message ?? "Google sign-in failed. Please try again.");
          setNeedsSignup(apiFailure?.status === 400 && apiFailure.message.includes("No GoalNet account is linked"));
        } finally {
          setBusy(false);
        }
    };

    if (window.__goalnetGoogleClientId !== clientId) {
      google.accounts.id.initialize({ client_id: clientId, callback: (response) => { void window.__goalnetGoogleCredentialHandler?.(response); } });
      window.__goalnetGoogleClientId = clientId;
    }
    target.replaceChildren();
    google.accounts.id.renderButton(target, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: Math.min(400, Math.max(220, Math.floor(target.getBoundingClientRect().width))),
    });
  }

  if (!clientId) {
    return <p className="text-center text-xs text-muted">Google sign-in is unavailable until GOOGLE_CLIENT_ID is configured.</p>;
  }

  return (
    <div>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onError={() => setError("Google sign-in could not load. Check your connection and try again.")} onReady={initialize} />
      <div aria-busy={busy} className={`flex min-h-10 justify-center overflow-hidden ${busy ? "pointer-events-none opacity-50" : ""}`} ref={buttonRef} />
      {busy && <p className="mt-2 text-center text-xs text-muted">Signing in with Google…</p>}
      {error && <p aria-live="polite" className="mt-2 text-center text-xs text-red-700" role="alert">{error}</p>}
      {needsSignup && <p className="mt-2 text-center text-xs"><Link className="font-semibold text-ink underline underline-offset-2" href={signupHref}>Create Account</Link></p>}
    </div>
  );
}
