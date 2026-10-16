"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role === "admin") {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center text-olive-muted">
          Loading profile…
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-16">
        <p className="text-xs uppercase tracking-[0.24em] text-terracotta">
          Customer studio
        </p>
        <h1 className="mt-2 font-display text-4xl text-olive">Your profile</h1>
        <p className="mt-3 text-olive-muted">
          Welcome back to Madeye Enterprises. This is your personal space for
          saved pieces and future orders.
        </p>

        <section className="mt-10 rounded-3xl bg-ivory p-8 ring-1 ring-sand">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-olive-muted">
                Name
              </dt>
              <dd className="mt-1 font-display text-xl text-olive">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-olive-muted">
                Email
              </dt>
              <dd className="mt-1 text-olive">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-olive-muted">
                Account
              </dt>
              <dd className="mt-1 capitalize text-olive">{user.role}</dd>
            </div>
          </dl>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#shop"
            className="rounded-full bg-terracotta px-5 py-2.5 text-sm text-ivory hover:bg-terracotta-dark"
          >
            Browse décor
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="rounded-full border border-olive/20 px-5 py-2.5 text-sm text-olive"
          >
            Sign out
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
