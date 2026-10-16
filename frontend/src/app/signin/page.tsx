"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { login, profilePath } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const data = await login({ email, password });
      setAuth(data.token, data.user);
      router.push(profilePath(data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-3xl bg-ivory p-8 shadow-sm ring-1 ring-sand"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-terracotta">
            Welcome back
          </p>
          <h1 className="mt-2 font-display text-3xl text-olive">Sign in</h1>
          <p className="mt-2 text-sm text-olive-muted">
            Customers open a studio profile. Admins open the atelier desk.
          </p>
          <label className="mt-6 block text-sm text-olive">
            Email
            <input
              required
              type="email"
              name="email"
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <label className="mt-4 block text-sm text-olive">
            Password
            <input
              required
              type="password"
              name="password"
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-full bg-terracotta py-2.5 text-sm text-ivory hover:bg-terracotta-dark disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
          {error ? <p className="mt-3 text-sm text-terracotta">{error}</p> : null}
          <p className="mt-6 text-center text-sm text-olive-muted">
            New here?{" "}
            <Link href="/signup" className="text-terracotta hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}
