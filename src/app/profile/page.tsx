import { AppShell } from "@/components/layout/app-shell";
import { ProfileEditor } from "@/components/forms/profile-editor";
import { getRepository } from "@/lib/data/repository";

export default async function ProfilePage() {
  const repository = getRepository();
  const profile = await repository.getProfileBundle();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Organization Profile</h1>
        <p className="mt-2 text-muted">
          This is the scoring context: capabilities, certifications, disqualifiers, and strategic goals.
        </p>
      </div>
      <ProfileEditor initialProfile={profile} />
    </AppShell>
  );
}
