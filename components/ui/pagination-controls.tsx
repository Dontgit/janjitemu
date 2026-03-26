import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PaginationControls({
  page,
  perPage,
  total,
  totalPages,
  createPageHref,
  createPerPageHref,
  className
}: {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  createPageHref: (page: number) => string;
  createPerPageHref: (perPage: number) => string;
  className?: string;
}) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = total === 0 ? 0 : Math.min(page * perPage, total);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="text-sm text-[var(--muted)]">
        Menampilkan {from}-{to} dari {total} data.
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--muted)]">Per halaman</span>
        {[10, 20, 50].map((option) => {
          const active = perPage === option;

          return (
            <Link
              key={option}
              href={createPerPageHref(option)}
              className={buttonVariants(active ? "primary" : "secondary", "px-3 py-2 text-xs")}
            >
              {option}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link
          href={createPageHref(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={buttonVariants(
            "secondary",
            cn("px-3 py-2 text-xs", page <= 1 && "pointer-events-none opacity-50")
          )}
        >
          Sebelumnya
        </Link>
        <span className="text-sm text-[var(--muted)]">
          Halaman {Math.min(page, Math.max(totalPages, 1))} / {Math.max(totalPages, 1)}
        </span>
        <Link
          href={createPageHref(Math.min(totalPages || 1, page + 1))}
          aria-disabled={page >= totalPages}
          className={buttonVariants(
            "secondary",
            cn("px-3 py-2 text-xs", (totalPages === 0 || page >= totalPages) && "pointer-events-none opacity-50")
          )}
        >
          Berikutnya
        </Link>
      </div>
    </div>
  );
}
