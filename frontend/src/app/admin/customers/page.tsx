"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { fetchAdminCustomers } from "@/lib/auth";

type Customer = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function AdminCustomersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

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

    fetchAdminCustomers()
      .then((data) => setCustomers(data.customers))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load customers")
      );
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center text-olive-muted">
          Loading customers…
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-16">
        <Link href="/admin" className="text-sm text-terracotta hover:underline">
          Back to admin profile
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.24em] text-terracotta">
          Customer directory
        </p>
        <h1 className="mt-2 font-display text-4xl text-olive">Customer signup details</h1>
        <p className="mt-3 text-olive-muted">
          {customers.length} registered customer{customers.length === 1 ? "" : "s"}.
        </p>

        <section className="mt-10 rounded-3xl bg-ivory p-8 ring-1 ring-sand">
          {error ? <p className="text-sm text-terracotta">{error}</p> : null}
          {!error && customers.length === 0 ? (
            <p className="text-sm text-olive-muted">No customers have registered yet.</p>
          ) : null}
          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <thead className="border-b border-sand text-xs uppercase tracking-[0.16em] text-olive-muted">
                  <tr>
                    <th className="pb-3 pr-4 font-normal">Name</th>
                    <th className="pb-3 pr-4 font-normal">Email</th>
                    <th className="pb-3 font-normal">Signup date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/70 text-olive">
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="py-4 pr-4">{customer.name}</td>
                      <td className="py-4 pr-4">{customer.email}</td>
                      <td className="py-4 text-olive-muted">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
