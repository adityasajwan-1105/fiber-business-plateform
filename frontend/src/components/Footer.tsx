import Link from "next/link";

export function Footer({ content }: { content?: { footerTitle: string; footerCopy: string; instagramHandle: string; facebookHandle: string; companyEmail: string } }) {
  const footerContent = content || {
    footerTitle: "Madeye Enterprises",
    footerCopy: "Flower pots, decorative objects, and home décor for rooms that want to bloom.",
    instagramHandle: "@madeyeenterprises",
    facebookHandle: "Madeye Enterprises",
    companyEmail: "hello@madeyeenterprises.com",
  };
  return (
    <footer className="border-t border-sand bg-olive text-ivory">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-2xl">{footerContent.footerTitle}</p>
          <p className="mt-2 max-w-sm text-sm text-ivory/70">
            {footerContent.footerCopy}
          </p>
        </div>
        <div className="flex gap-10 text-sm text-ivory/80">
          <div className="flex flex-col gap-2">
            <Link href="/#shop">Shop</Link>
            <Link href="/about">About</Link>
            <Link href="/#support">Support</Link>
          </div>
          <div className="flex flex-col gap-2">
            <a href={`https://instagram.com/${footerContent.instagramHandle.replace(/^@/, "")}`} target="_blank" rel="noreferrer">Instagram</a>
            <a href={`https://facebook.com/${footerContent.facebookHandle}`} target="_blank" rel="noreferrer">Facebook</a>
            <a href={`mailto:${footerContent.companyEmail}`}>Email us</a>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
      <p className="border-t border-ivory/10 px-5 py-4 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} Madeye Enterprises. All rights reserved.
      </p>
    </footer>
  );
}
