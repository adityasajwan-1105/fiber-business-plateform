"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { fetchAdminOverview, updateAdminCredentials } from "@/lib/auth";

export default function AdminPage() {
  const { user, loading, logout, setAuth } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<{
    customers: number;
    admins: number;
    messages: number;
    customerDetails: {
      _id: string;
      name: string;
      email: string;
      createdAt: string;
    }[];
    studio: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/profile");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchAdminOverview()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load admin data")
      );
  }, [user]);

  async function onUpdateCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNote("");
    setPending(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") || "");
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const newPassword = String(data.get("newPassword") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      setPending(false);
      return;
    }

    try {
      const result = await updateAdminCredentials({
        currentPassword,
        name,
        email,
        newPassword: newPassword || undefined,
      });
      setAuth(result.token, result.user);
      setNote("Credentials updated. Use the new email and password next time you sign in.");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update credentials");
    } finally {
      setPending(false);
    }
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center text-olive-muted">
          Loading admin desk…
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-16">
        <p className="text-xs uppercase tracking-[0.24em] text-terracotta">
          Atelier desk
        </p>
        <h1 className="mt-2 font-display text-4xl text-olive">Admin profile</h1>
        <p className="mt-3 text-olive-muted">
          Signed in as {user.name}. Manage Madeye Enterprises and your secure login
          from this private desk.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-3xl bg-ivory p-6 ring-1 ring-sand">
            <p className="text-xs uppercase tracking-[0.18em] text-olive-muted">
              Admin
            </p>
            <p className="mt-2 font-display text-2xl text-olive">{user.name}</p>
            <p className="mt-1 text-sm text-olive-muted">{user.email}</p>
          </article>
          <button
            type="button"
            onClick={() => router.push("/admin/customers")}
            className="rounded-3xl bg-sage-deep p-6 text-left text-ivory transition hover:bg-sage-deep/90"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-ivory/70">
              Customers
            </p>
            <p className="mt-2 font-display text-4xl">
              {stats ? stats.customers : "—"}
            </p>
            <p className="mt-2 text-xs text-ivory/70">View customer details</p>
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/messages")}
            className="rounded-3xl bg-olive p-6 text-left text-ivory transition hover:bg-olive-muted"
          >
            <span className="text-3xl" aria-hidden="true">✉</span>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ivory/70">Messages</p>
            <p className="mt-2 font-display text-4xl">{stats ? stats.messages : "—"}</p>
            <p className="mt-2 text-xs text-ivory/70">View support messages</p>
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/landing")}
            className="rounded-3xl bg-terracotta p-6 text-left text-ivory transition hover:bg-terracotta-dark"
          >
            <span className="text-3xl" aria-hidden="true">✎</span>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ivory/70">
              Landing page
            </p>
            <p className="mt-2 font-display text-2xl">Edit sections</p>
          </button>
        </section>

        <form
          onSubmit={onUpdateCredentials}
          className="mt-10 rounded-3xl bg-ivory p-8 ring-1 ring-sand"
        >
          <h2 className="font-display text-2xl text-olive">Change credentials</h2>
          <p className="mt-2 text-sm text-olive-muted">
            Confirm your current password, then update name, email, or password.
            New passwords need 10+ characters with upper, lower, number, and symbol.
          </p>

          <label className="mt-6 block text-sm text-olive">
            Current password
            <input
              required
              type="password"
              name="currentPassword"
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <label className="mt-4 block text-sm text-olive">
            Display name
            <input
              name="name"
              defaultValue={user.name}
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <label className="mt-4 block text-sm text-olive">
            Login email
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <label className="mt-4 block text-sm text-olive">
            New password (optional)
            <input
              type="password"
              name="newPassword"
              minLength={10}
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <label className="mt-4 block text-sm text-olive">
            Confirm new password
            <input
              type="password"
              name="confirmPassword"
              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-6 rounded-full bg-olive px-6 py-2.5 text-sm text-ivory hover:bg-olive-muted disabled:opacity-60"
          >
            {pending ? "Saving…" : "Update credentials"}
          </button>
          {note ? <p className="mt-3 text-sm text-sage-deep">{note}</p> : null}
          {error ? <p className="mt-3 text-sm text-terracotta">{error}</p> : null}
        </form>

        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-8 w-fit rounded-full border border-olive/20 px-5 py-2.5 text-sm text-olive"
        >
          Sign out
        </button>
      </main>
      <Footer />
    </>
  );
}
