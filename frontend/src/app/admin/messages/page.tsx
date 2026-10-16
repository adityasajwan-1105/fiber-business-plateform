"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { deleteAdminMessage, fetchAdminMessages } from "@/lib/auth";

type Message = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/profile");
      return;
    }

    fetchAdminMessages()
      .then((data) => setMessages(data.messages))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load messages")
      );
  }, [loading, user, router]);

  async function clearMessage(id: string) {
    if (!window.confirm("Clear this support message?")) return;
    setDeleting(id);
    setError("");
    try {
      await deleteAdminMessage(id);
      setMessages((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear message");
    } finally {
      setDeleting(null);
    }
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center text-olive-muted">Loading messages…</main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-16">
        <Link href="/admin" className="text-sm text-terracotta hover:underline">Back to admin profile</Link>
        <p className="mt-8 text-xs uppercase tracking-[0.24em] text-terracotta">Inbox</p>
        <h1 className="mt-2 font-display text-4xl text-olive">Support messages</h1>
        <p className="mt-3 text-olive-muted">Newest messages appear first.</p>

        <section className="mt-10 space-y-5">
          {error ? <div className="rounded-3xl bg-ivory p-8 text-sm text-terracotta ring-1 ring-sand">{error}</div> : null}
          {!error && messages.length === 0 ? <div className="rounded-3xl bg-ivory p-8 text-sm text-olive-muted ring-1 ring-sand">No support messages yet.</div> : null}
          {messages.map((item) => (
            <article key={item._id} className="rounded-3xl bg-ivory p-6 ring-1 ring-sand">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-olive">{item.name}</h2>
                  <a href={`mailto:${item.email}`} className="text-sm text-terracotta hover:underline">{item.email}</a>
                </div>
                <time dateTime={item.createdAt} className="text-sm text-olive-muted">
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-5 whitespace-pre-wrap leading-relaxed text-olive-muted">{item.message}</p>
              <button
                type="button"
                onClick={() => clearMessage(item._id)}
                disabled={deleting === item._id}
                className="mt-5 rounded-full border border-terracotta/40 px-4 py-2 text-sm text-terracotta hover:bg-terracotta hover:text-ivory disabled:opacity-60"
              >
                {deleting === item._id ? "Clearing…" : "Clear message"}
              </button>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
