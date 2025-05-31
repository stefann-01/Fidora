import { Evidence } from "../models/db.types";
import { db_evidence } from '../db/db';

/**
 * A simple ID generator (same as in UserService).
 */
function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}

export const EvidenceService = {
  /**
   * create(evidenceData: Evidence): StoredEvidence
   * - Accepts raw Evidence fields, returns a new StoredEvidence with a generated `id`.
   */
  create(evidenceData: Omit<Evidence, "supportsClaim" | "title" | "description" | "wellStructuredPercentage"> & Evidence): Evidence {
    const newEv: Evidence = {
      id: generateId(),
      supportsClaim: evidenceData.supportsClaim,
      title: evidenceData.title,
      description: evidenceData.description,
      wellStructuredPercentage: evidenceData.wellStructuredPercentage,
    };
    db_evidence.push(newEv);
    return newEv;
  },

  /**
   * getOne(id: string): Evidence | undefined
   * - Returns a single evidence item by its generated `id`, or `undefined`.
   */
  getOne(id: string): Evidence | undefined {
    return db_evidence.find((e) => e.id === id);
  },

  /**
   * getAll(): Evidence[]
   * - Returns all stored evidence items.
   */
  getAll(): Evidence[] {
    return [...db_evidence];
  },
};