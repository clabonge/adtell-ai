"use client";

export function PrintBrief() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center bg-ivory px-4 text-sm font-semibold text-void hover:bg-ivory-deep print:hidden"
    >
      Print this brief
    </button>
  );
}
