import { Evidence } from '../../frontend/app/types/types';
import { evidence } from '../db/db';

// Get evidence by title (assuming title is unique identifier)
export function getEvidence(title: string): Evidence | undefined {
  return evidence.find(ev => ev.title === title);
}

// Get all evidence
export function getAllEvidence(): Evidence[] {
  return [...evidence]; // Return a copy to prevent direct mutation
}

// Get evidence that supports claims
export function getSupportingEvidence(): Evidence[] {
  return evidence.filter(ev => ev.supportsClaim === true);
}

// Get evidence that contradicts claims
export function getContradictingEvidence(): Evidence[] {
  return evidence.filter(ev => ev.supportsClaim === false);
}

// Add new evidence
export function addEvidence(evidenceItem: Evidence): boolean {
  // Check if evidence already exists (by title)
  if (evidence.some(existingEvidence => existingEvidence.title === evidenceItem.title)) {
    return false; // Evidence already exists
  }
  evidence.push(evidenceItem);
  return true;
}

// Edit existing evidence
export function editEvidence(title: string, updatedEvidence: Partial<Evidence>): boolean {
  const evidenceIndex = evidence.findIndex(ev => ev.title === title);
  if (evidenceIndex === -1) {
    return false; // Evidence not found
  }
  
  // Merge the existing evidence with updated fields
  evidence[evidenceIndex] = { ...evidence[evidenceIndex], ...updatedEvidence };
  return true;
}

// Remove evidence
export function removeEvidence(title: string): boolean {
  const evidenceIndex = evidence.findIndex(ev => ev.title === title);
  if (evidenceIndex === -1) {
    return false; // Evidence not found
  }
  
  evidence.splice(evidenceIndex, 1);
  return true;
} 