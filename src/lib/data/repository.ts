import type {
  Capability,
  Certification,
  Disqualifier,
  Evaluation,
  LibraryItem,
  Organization,
  OrganizationProfile,
  Outcome,
  PastPerformance,
  Rfp,
  RfpWithEvaluation,
  ScoringContext
} from "@/lib/schemas/domain";
import { getDemoRepository } from "@/lib/data/demo-store";
import { getSupabaseRepository, isSupabaseConfigured } from "@/lib/db/supabase-repository";

export type ProfileBundle = {
  organization: Organization;
  profile: OrganizationProfile;
  capabilities: Capability[];
  certifications: Certification[];
  disqualifiers: Disqualifier[];
};

export type DataRepository = {
  mode: "demo" | "supabase";
  listRfps(): Promise<RfpWithEvaluation[]>;
  getRfp(id: string): Promise<RfpWithEvaluation | null>;
  createRfp(rfp: Rfp): Promise<RfpWithEvaluation>;
  createRfpWithEvaluation(input: { rfp: Rfp; evaluation: Evaluation; outcome: Outcome }): Promise<RfpWithEvaluation>;
  updateRfp(id: string, patch: Partial<Rfp> & { outcome_record?: Partial<Outcome> }): Promise<RfpWithEvaluation | null>;
  getScoringContext(): Promise<ScoringContext>;
  getProfileBundle(): Promise<ProfileBundle>;
  updateProfileBundle(patch: Partial<ProfileBundle>): Promise<ProfileBundle>;
  listPastPerformance(): Promise<PastPerformance[]>;
  upsertPastPerformance(record: PastPerformance): Promise<PastPerformance>;
  deletePastPerformance(id: string): Promise<void>;
  listLibraryItems(): Promise<LibraryItem[]>;
  upsertLibraryItem(record: LibraryItem): Promise<LibraryItem>;
  deleteLibraryItem(id: string): Promise<void>;
};

export function getRepository(): DataRepository {
  if (isSupabaseConfigured()) {
    return getSupabaseRepository();
  }

  return getDemoRepository();
}
