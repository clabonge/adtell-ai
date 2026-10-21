"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auditPath } from "@/content/nav";

export function MobileAuditBar() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  return (
    <div className="md:hidden">
      <div className="h-20" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-void px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link
          href={auditPath}
          className="flex min-h-11 items-center justify-center bg-ivory px-4 text-sm font-semibold text-void hover:bg-ivory-deep"
        >
          Free AI audit · Request
        </Link>
      </div>
    </div>
  );
}
