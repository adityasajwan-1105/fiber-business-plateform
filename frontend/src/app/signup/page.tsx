"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { register } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      await register({
        name,
        email,
        password,
        role: "user",
      });
      router.push("/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
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
            Join the atelier
          </p>
          <h1 className="mt-2 font-display text-3xl text-olive">Sign up</h1>
          <p className="mt-2 text-sm text-olive-muted">
            Create your customer profile to keep your saved pieces and orders in one place.
          </p>

          <label className="mt-6 block text-sm text-olive">
            Name
            <input
              required
              name="name"
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <label className="mt-4 block text-sm text-olive">
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
              minLength={8}
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-full bg-terracotta py-2.5 text-sm text-ivory hover:bg-terracotta-dark disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
          {error ? <p className="mt-3 text-sm text-terracotta">{error}</p> : null}
          <p className="mt-6 text-center text-sm text-olive-muted">
            Already have an account?{" "}
            <Link href="/signin" className="text-terracotta hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}
