import { AppShell } from "@/components/layout/app-shell";
import { LibraryManager } from "@/components/forms/library-manager";
import { getRepository } from "@/lib/data/repository";

export default async function LibraryPage() {
  const repository = getRepository();
  const items = await repository.listLibraryItems();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Library</h1>
        <p className="mt-2 text-muted">
          Reusable content for company overview, methodology, staffing, quality, and security sections.
        </p>
      </div>
      <LibraryManager initialItems={items} />
    </AppShell>
  );
}
