import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RfpDetail } from "@/components/rfp/rfp-detail";
import { getRepository } from "@/lib/data/repository";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RfpDetailPage({ params }: Props) {
  const { id } = await params;
  const repository = getRepository();
  const rfp = await repository.getRfp(id);

  if (!rfp) notFound();

  return (
    <AppShell>
      <RfpDetail rfp={rfp} />
    </AppShell>
  );
}
