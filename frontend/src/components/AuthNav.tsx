"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { profilePath } from "@/lib/auth";

export function AuthNav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="h-9 w-36 rounded-full bg-sand/70" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/signin"
          className="rounded-full border border-olive/20 px-4 py-2 text-sm text-olive transition hover:border-olive/40 hover:bg-ivory"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-terracotta px-4 py-2 text-sm text-ivory transition hover:bg-terracotta-dark"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={profilePath(user.role)}
        className="rounded-full border border-olive/20 px-4 py-2 text-sm text-olive hover:bg-ivory"
      >
        {user.role === "admin" ? "Admin profile" : "My profile"}
      </Link>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="rounded-full bg-olive px-4 py-2 text-sm text-ivory hover:bg-olive-muted"
      >
        Sign out
      </button>
    </div>
  );
}
