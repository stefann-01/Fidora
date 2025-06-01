// backend/src/services/UserService.ts

import { db_users } from "../db/db"; // your in-memory array
import { User } from "../models/db.types";

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
      rating: Math.floor(Math.random() * 100) + 1, // Random rating between 1-100
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

  /**
   * getByUsername(username: string): User | undefined
   * - Returns the user with the given username, or undefined if not found.
   */
  getByUsername(username: string): User | undefined {
    return db_users.find((u) => u.username === username);
  },

  /**
   * createIfNotExists(username: string): User
   * - Creates a new user with the given username if they don't exist.
   * - Returns the existing user if they already exist.
   */
  createIfNotExists(username: string, tweet: string): User {
    const existingUser = this.getByUsername(username);
    if (existingUser) {
      return existingUser;
    }

    // Create new user with default values
    const newUser: User = {
      id: generateId(),
      profilePic: "", // Default empty profile pic
      username: username,
      latestPostContent: tweet,
      rating: Math.floor(Math.random() * 100) + 1, // Random rating between 1-100
      claims: [],
    };
    
    db_users.push(newUser);
    
    // TODO: Populate user information (profilePic, latestPostContent, rating) using external API
    // This should fetch additional user data from Twitter/X API or other social media platforms
    // to enrich the user profile with real information
    
    return newUser;
  },
};
