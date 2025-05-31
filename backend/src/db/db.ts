// backend/src/db/db.ts
import { Group } from '@semaphore-protocol/group';
import { Claim, Evidence, User } from '../models/db.types';

export const db_users: User[] = [];

export const db_claims: Claim[] = [];

export const db_evidence: Evidence[] = [];
