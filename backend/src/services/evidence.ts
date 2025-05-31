// backend/src/services/EvidenceService.ts

import { Evidence } from "../models/db.types";
import { db_evidence } from "../db/db";

/**
 * We assume your `db.types.ts` defines `Evidence` like this:
 *
 *   export interface Evidence {
 *     id: string;
 *     supportsClaim: boolean;
 *     title: string;
 *     description: string;
 *     wellStructuredPercentage: number;
 *   }
 *
 * So in `create`, we accept everything except `id`.
 */

/** Simple ID‐generator (not a true UUID) */
function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}

export const EvidenceService = {
  /**
   * create(data: Omit<Evidence, "id">): Evidence
   * - Accepts an object with all fields except `id`, generates `id` internally,
   *   pushes it into the in‐memory store, and returns the full `Evidence`.
   */
  create(data: Omit<Evidence, "id">): Evidence {
    const newEv: Evidence = {
      id: generateId(),
      supportsClaim: data.supportsClaim,
      title: data.title,
      description: data.description,
      wellStructuredPercentage: data.wellStructuredPercentage,
    };
    db_evidence.push(newEv);
    return newEv;
  },

  /**
   * getOne(id: string): Evidence | undefined
   * - Returns the Evidence with the given `id`, or undefined if none found.
   */
  getOne(id: string): Evidence | undefined {
    return db_evidence.find((e) => e.id === id);
  },

  /**
   * getAll(): Evidence[]
   * - Returns a shallow copy of all stored Evidence items.
   */
  getAll(): Evidence[] {
    return [...db_evidence];
  },
};
