import { User } from '../../frontend/app/types/types';
import { users } from '../db/db';

// Get user by username
export function getUser(username: string): User | undefined {
  return users.find(user => user.username === username);
}

// Get all users
export function getAllUsers(): User[] {
  return [...users]; // Return a copy to prevent direct mutation
}

// Add a new user
export function addUser(user: User): boolean {
  // Check if user already exists
  if (users.some(existingUser => existingUser.username === user.username)) {
    return false; // User already exists
  }
  users.push(user);
  return true;
}

// Edit an existing user
export function editUser(username: string, updatedUser: Partial<User>): boolean {
  const userIndex = users.findIndex(user => user.username === username);
  if (userIndex === -1) {
    return false; // User not found
  }
  
  // Merge the existing user with updated fields
  users[userIndex] = { ...users[userIndex], ...updatedUser };
  return true;
}

// Remove a user
export function removeUser(username: string): boolean {
  const userIndex = users.findIndex(user => user.username === username);
  if (userIndex === -1) {
    return false; // User not found
  }
  
  users.splice(userIndex, 1);
  return true;
}
