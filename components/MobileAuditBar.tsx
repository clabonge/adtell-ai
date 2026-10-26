"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auditPath } from "@/content/nav";

export function MobileAuditBar() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  return (
    <div className="md:hidden print:hidden">
      <div className="h-20" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-void px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link
          href={auditPath}
          className="flex min-h-11 w-full items-center justify-center whitespace-nowrap bg-ivory px-3 text-[13px] font-semibold text-void hover:bg-ivory-deep min-[380px]:text-sm"
        >
          Request a free AI audit
        </Link>
      </div>
    </div>
  );
}
