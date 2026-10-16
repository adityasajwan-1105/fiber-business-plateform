"use client";

import { FormEvent, useState } from "react";
import { sendSupportMessage } from "@/lib/auth";

export function Support({ content }: { content: { supportEyebrow: string; supportTitle: string } }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(false);
    setError("");
    setPending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await sendSupportMessage({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        message: String(data.get("message") || ""),
      });
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="support" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.28em] text-terracotta">
          {content.supportEyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl text-olive md:text-4xl">
          {content.supportTitle}
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-3xl bg-ivory p-6 ring-1 ring-sand">
              <h3 className="font-display text-xl">Hours & contact</h3>
              <ul className="mt-4 space-y-2 text-olive-muted">
                <li>Monday – Saturday, 10:00 – 19:00 IST</li>
                <li>hello@madeyeenterprises.com</li>
                <li>+91 98765 43210</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-ivory p-6 ring-1 ring-sand">
              <h3 className="font-display text-xl">Help topics</h3>
              <ul className="mt-4 space-y-2 text-olive-muted">
                <li>Orders & tracking</li>
                <li>Delivery of pots and fragile décor</li>
                <li>Plant & ceramic care guides</li>
              </ul>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl bg-sage-deep p-8 text-ivory"
          >
            <h3 className="font-display text-2xl">Contact support</h3>
            <p className="mt-2 text-sm text-ivory/80">
              Tell us about an order, a planter, or a piece that needs extra care.
            </p>
            <label className="mt-6 block text-sm">
              Name
              <input
                required
                name="name"
                className="mt-1 w-full rounded-xl border-0 bg-ivory/95 px-3 py-2 text-olive outline-none"
              />
            </label>
            <label className="mt-4 block text-sm">
              Email
              <input
                required
                type="email"
                name="email"
                className="mt-1 w-full rounded-xl border-0 bg-ivory/95 px-3 py-2 text-olive outline-none"
              />
            </label>
            <label className="mt-4 block text-sm">
              Message
              <textarea
                required
                name="message"
                rows={4}
                className="mt-1 w-full rounded-xl border-0 bg-ivory/95 px-3 py-2 text-olive outline-none"
              />
            </label>
            <button
              type={sent ? "button" : "submit"}
              onClick={sent ? () => setSent(false) : undefined}
              disabled={pending}
              className={`mt-6 rounded-full px-6 py-2.5 text-sm text-ivory ${sent ? "bg-sage hover:bg-sage-deep" : "bg-terracotta hover:bg-terracotta-dark"}`}
            >
              {pending ? "Sending…" : sent ? "Send another message" : "Send message"}
            </button>
            {sent ? (
              <p className="mt-3 text-sm text-gold">
                Thank you — our atelier team will reply soon.
              </p>
            ) : null}
            {error ? <p className="mt-3 text-sm text-gold">{error}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
