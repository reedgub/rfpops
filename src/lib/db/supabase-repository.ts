import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Evaluation,
  LibraryItem,
  Outcome,
  PastPerformance,
  Rfp,
  RfpWithEvaluation
} from "@/lib/schemas/domain";
import type { DataRepository, ProfileBundle } from "@/lib/data/repository";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function clientOrThrow() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }
  return client;
}

async function latestEvaluationFor(rfpId: string): Promise<Evaluation | undefined> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from("evaluations")
    .select("raw_json")
    .eq("rfp_id", rfpId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.raw_json as Evaluation | undefined;
}

async function outcomeFor(rfpId: string): Promise<Outcome | undefined> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from("outcomes")
    .select("*")
    .eq("rfp_id", rfpId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Outcome | undefined;
}

export function getSupabaseRepository(): DataRepository {
  return {
    mode: "supabase",
    async listRfps() {
      const client = clientOrThrow();
      const { data, error } = await client.from("rfps").select("*").order("due_date", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as Rfp[];
      return Promise.all(
        rows.map(async (rfp): Promise<RfpWithEvaluation> => ({
          ...rfp,
          evaluation: await latestEvaluationFor(rfp.id),
          outcome_record: await outcomeFor(rfp.id)
        }))
      );
    },
    async getRfp(id) {
      const client = clientOrThrow();
      const { data, error } = await client.from("rfps").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...(data as Rfp),
        evaluation: await latestEvaluationFor(id),
        outcome_record: await outcomeFor(id)
      };
    },
    async createRfp(rfp) {
      const client = clientOrThrow();
      const { data, error } = await client.from("rfps").insert(rfp).select("*").single();
      if (error) throw error;
      return data as RfpWithEvaluation;
    },
    async createRfpWithEvaluation({ rfp, evaluation, outcome }) {
      const client = clientOrThrow();
      const { error: rfpError } = await client.from("rfps").insert(rfp);
      if (rfpError) throw rfpError;
      const { error: evalError } = await client.from("evaluations").insert({
        id: evaluation.id,
        rfp_id: rfp.id,
        organization_id: rfp.organization_id,
        verdict: evaluation.verdict,
        confidence: evaluation.confidence,
        composite_score: evaluation.composite_score,
        tldr: evaluation.tldr,
        recommendation_memo: evaluation.recommendation_memo,
        effort_min_hours: evaluation.effort_estimate.min_hours,
        effort_max_hours: evaluation.effort_estimate.max_hours,
        raw_json: evaluation,
        qa_json: evaluation.qa_checks,
        model_used: evaluation.model_used,
        prompt_version: evaluation.prompt_version
      });
      if (evalError) throw evalError;

      if (evaluation.compliance_requirements.length) {
        const { error: complianceError } = await client.from("compliance_requirements").insert(
          evaluation.compliance_requirements.map((requirement) => ({
            evaluation_id: evaluation.id,
            requirement_id: requirement.id,
            section: requirement.section,
            requirement_text: requirement.requirement_text,
            requirement_type: requirement.requirement_type,
            mandatory: requirement.mandatory,
            risk: requirement.risk,
            owner: requirement.owner,
            status: requirement.status,
            source_citation: requirement.source_citation
          }))
        );
        if (complianceError) throw complianceError;
      }

      const { error: outcomeError } = await client.from("outcomes").insert(outcome);
      if (outcomeError) throw outcomeError;
      return { ...rfp, evaluation, outcome_record: outcome };
    },
    async updateRfp(id, patch) {
      const client = clientOrThrow();
      const { outcome_record, ...rfpPatch } = patch;
      if (Object.keys(rfpPatch).length) {
        const { error } = await client
          .from("rfps")
          .update({ ...rfpPatch, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      }
      if (outcome_record) {
        const existing = await outcomeFor(id);
        if (existing) {
          const { error } = await client
            .from("outcomes")
            .update({ ...outcome_record, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
          if (error) throw error;
        }
      }
      return this.getRfp(id);
    },
    async getScoringContext() {
      const bundle = await this.getProfileBundle();
      const pastPerformance = await this.listPastPerformance();
      return { ...bundle, pastPerformance };
    },
    async getProfileBundle() {
      const client = clientOrThrow();
      const { data: organizations, error: orgError } = await client
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1);
      if (orgError) throw orgError;
      const organization = organizations?.[0];
      if (!organization) throw new Error("No organization found. Apply seed.sql or create an organization.");
      const organizationId = organization.id as string;

      const [profile, capabilities, certifications, disqualifiers] = await Promise.all([
        client.from("organization_profiles").select("*").eq("organization_id", organizationId).maybeSingle(),
        client.from("capabilities").select("*").eq("organization_id", organizationId),
        client.from("certifications").select("*").eq("organization_id", organizationId),
        client.from("disqualifiers").select("*").eq("organization_id", organizationId)
      ]);

      if (profile.error) throw profile.error;
      if (capabilities.error) throw capabilities.error;
      if (certifications.error) throw certifications.error;
      if (disqualifiers.error) throw disqualifiers.error;

      return {
        organization,
        profile: profile.data,
        capabilities: capabilities.data ?? [],
        certifications: certifications.data ?? [],
        disqualifiers: disqualifiers.data ?? []
      } as ProfileBundle;
    },
    async updateProfileBundle(patch) {
      const client = clientOrThrow();
      const bundle = await this.getProfileBundle();
      if (patch.organization) {
        const { error } = await client.from("organizations").update(patch.organization).eq("id", bundle.organization.id);
        if (error) throw error;
      }
      if (patch.profile) {
        const { error } = await client
          .from("organization_profiles")
          .update(patch.profile)
          .eq("id", bundle.profile.id);
        if (error) throw error;
      }
      return this.getProfileBundle();
    },
    async listPastPerformance() {
      const client = clientOrThrow();
      const bundle = await this.getProfileBundle();
      const { data, error } = await client
        .from("past_performance")
        .select("*")
        .eq("organization_id", bundle.organization.id)
        .order("period_end", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PastPerformance[];
    },
    async upsertPastPerformance(record) {
      const client = clientOrThrow();
      const bundle = await this.getProfileBundle();
      const { data, error } = await client
        .from("past_performance")
        .upsert({ ...record, organization_id: bundle.organization.id })
        .select("*")
        .single();
      if (error) throw error;
      return data as PastPerformance;
    },
    async deletePastPerformance(id) {
      const client = clientOrThrow();
      const { error } = await client.from("past_performance").delete().eq("id", id);
      if (error) throw error;
    },
    async listLibraryItems() {
      const client = clientOrThrow();
      const bundle = await this.getProfileBundle();
      const { data, error } = await client
        .from("library_items")
        .select("*")
        .eq("organization_id", bundle.organization.id)
        .order("title");
      if (error) throw error;
      return (data ?? []) as LibraryItem[];
    },
    async upsertLibraryItem(record) {
      const client = clientOrThrow();
      const bundle = await this.getProfileBundle();
      const { data, error } = await client
        .from("library_items")
        .upsert({ ...record, organization_id: bundle.organization.id })
        .select("*")
        .single();
      if (error) throw error;
      return data as LibraryItem;
    },
    async deleteLibraryItem(id) {
      const client = clientOrThrow();
      const { error } = await client.from("library_items").delete().eq("id", id);
      if (error) throw error;
    }
  };
}
