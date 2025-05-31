// backend/src/services/UserService.ts

import { User, Claim } from "../models/db.types";
import { db_users } from "../db/db"; // your in-memory array

/**
 * Helper: generate a simple unique ID (not a true UUID, but good enough for mocks).
 */
function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}

export const UserService = {
  /**
   * create(userData: Omit<User, "id">): User
   *
   * We accept everything in User except `id`, generate `id` internally,
   * store it in `db_users`, and return the full User (with the generated id).
   */
  create(userData: Omit<User, "id">): User {
    const newUser: User = {
      id: generateId(),
      profilePic: userData.profilePic,
      username: userData.username,
      latestPostContent: userData.latestPostContent,
      rating: userData.rating,
      isOnJury: userData.isOnJury,
      claims: userData.claims ?? [],
    };
    db_users.push(newUser);
    return newUser;
  },

  /**
   * getOne(id: string): User | undefined
   * - Returns the user with the given `id`, or `undefined` if not found.
   */
  getOne(id: string): User | undefined {
    return db_users.find((u) => u.id === id);
  },

  /**
   * getAll(): User[]
   * - Returns all stored users (shallow copy).
   */
  getAll(): User[] {
    return [...db_users];
  },
};
