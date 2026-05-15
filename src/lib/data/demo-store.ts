import {
  demoCapabilities,
  demoCertifications,
  demoDisqualifiers,
  demoEvaluations,
  demoLibraryItems,
  demoOrganization,
  demoPastPerformance,
  demoProfile,
  demoRfps,
  demoOutcomes
} from "@/lib/demo/seed";
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
  RfpWithEvaluation
} from "@/lib/schemas/domain";
import type { DataRepository, ProfileBundle } from "@/lib/data/repository";

type DemoState = {
  organization: Organization;
  profile: OrganizationProfile;
  capabilities: Capability[];
  certifications: Certification[];
  disqualifiers: Disqualifier[];
  pastPerformance: PastPerformance[];
  libraryItems: LibraryItem[];
  rfps: Rfp[];
  evaluations: Evaluation[];
  outcomes: Outcome[];
};

const state: DemoState = {
  organization: structuredClone(demoOrganization),
  profile: structuredClone(demoProfile),
  capabilities: structuredClone(demoCapabilities),
  certifications: structuredClone(demoCertifications),
  disqualifiers: structuredClone(demoDisqualifiers),
  pastPerformance: structuredClone(demoPastPerformance),
  libraryItems: structuredClone(demoLibraryItems),
  rfps: structuredClone(demoRfps),
  evaluations: structuredClone(demoEvaluations),
  outcomes: structuredClone(demoOutcomes)
};

function attach(rfp: Rfp): RfpWithEvaluation {
  return {
    ...rfp,
    evaluation: state.evaluations.find((evaluation) => evaluation.rfp_id === rfp.id),
    outcome_record: state.outcomes.find((outcome) => outcome.rfp_id === rfp.id)
  };
}

export function getDemoRepository(): DataRepository {
  return {
    mode: "demo",
    async listRfps() {
      return state.rfps
        .map(attach)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    },
    async getRfp(id) {
      const rfp = state.rfps.find((item) => item.id === id);
      return rfp ? attach(rfp) : null;
    },
    async createRfp(rfp) {
      state.rfps.unshift(rfp);
      return attach(rfp);
    },
    async createRfpWithEvaluation({ rfp, evaluation, outcome }) {
      state.rfps.unshift(rfp);
      state.evaluations.unshift(evaluation);
      state.outcomes.unshift(outcome);
      return attach(rfp);
    },
    async updateRfp(id, patch) {
      const index = state.rfps.findIndex((rfp) => rfp.id === id);
      if (index < 0) return null;
      const { outcome_record, ...rfpPatch } = patch;
      state.rfps[index] = {
        ...state.rfps[index],
        ...rfpPatch,
        updated_at: new Date().toISOString()
      };

      if (outcome_record) {
        const outcomeIndex = state.outcomes.findIndex((outcome) => outcome.rfp_id === id);
        if (outcomeIndex >= 0) {
          state.outcomes[outcomeIndex] = {
            ...state.outcomes[outcomeIndex],
            ...outcome_record,
            updated_at: new Date().toISOString()
          };
        }
      }

      return attach(state.rfps[index]);
    },
    async getScoringContext() {
      return {
        organization: state.organization,
        profile: state.profile,
        capabilities: state.capabilities,
        certifications: state.certifications,
        disqualifiers: state.disqualifiers,
        pastPerformance: state.pastPerformance
      };
    },
    async getProfileBundle() {
      return {
        organization: state.organization,
        profile: state.profile,
        capabilities: state.capabilities,
        certifications: state.certifications,
        disqualifiers: state.disqualifiers
      };
    },
    async updateProfileBundle(patch: Partial<ProfileBundle>) {
      if (patch.organization) {
        state.organization = { ...state.organization, ...patch.organization };
      }
      if (patch.profile) {
        state.profile = { ...state.profile, ...patch.profile };
      }
      if (patch.capabilities) {
        state.capabilities = patch.capabilities;
      }
      if (patch.certifications) {
        state.certifications = patch.certifications;
      }
      if (patch.disqualifiers) {
        state.disqualifiers = patch.disqualifiers;
      }
      return {
        organization: state.organization,
        profile: state.profile,
        capabilities: state.capabilities,
        certifications: state.certifications,
        disqualifiers: state.disqualifiers
      };
    },
    async listPastPerformance() {
      return state.pastPerformance;
    },
    async upsertPastPerformance(record) {
      const index = state.pastPerformance.findIndex((item) => item.id === record.id);
      if (index >= 0) state.pastPerformance[index] = record;
      else state.pastPerformance.unshift(record);
      return record;
    },
    async deletePastPerformance(id) {
      state.pastPerformance = state.pastPerformance.filter((item) => item.id !== id);
    },
    async listLibraryItems() {
      return state.libraryItems;
    },
    async upsertLibraryItem(record) {
      const index = state.libraryItems.findIndex((item) => item.id === record.id);
      if (index >= 0) state.libraryItems[index] = record;
      else state.libraryItems.unshift(record);
      return record;
    },
    async deleteLibraryItem(id) {
      state.libraryItems = state.libraryItems.filter((item) => item.id !== id);
    }
  };
}
