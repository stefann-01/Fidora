// backend/src/routes/userRoutes.ts

import { Router, Request, Response, NextFunction } from "express";
import { UserService } from "../services/user";
import { User, Claim } from "../models/db.types";

const router = Router();

/**
 * POST /api/users
 * Creates a new user.
 * Expects a JSON body with:
 *   {
 *     profilePic: string;
 *     username: string;
 *     latestPostContent: string;
 *     rating: number;
 *     isOnJury: boolean;
 *     claims?: Claim[];
 *   }
 *
 * Returns: 201 Created with the new User (including generated `id`).
 */
router.post(
  "/",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req.body;

      // Validate required fields:
      if (
        typeof payload.profilePic !== "string" ||
        typeof payload.username !== "string" ||
        typeof payload.latestPostContent !== "string" ||
        typeof payload.rating !== "number" ||
        typeof payload.isOnJury !== "boolean"
      ) {
        res.status(400).json({ error: "Invalid user payload" });
        return;
      }

      // Build the new user data, defaulting claims to an empty array if missing:
      const newUserData: Omit<User, "id"> & { claims?: Claim[] } = {
        profilePic: payload.profilePic,
        username: payload.username,
        latestPostContent: payload.latestPostContent,
        rating: payload.rating,
        claims: Array.isArray(payload.claims) ? payload.claims : [],
      };

      const createdUser = UserService.create(newUserData);
      res.status(201).json(createdUser);
    } catch (err: any) {
      next(err);
    }
  }
);

/**
 * GET /api/users/:id
 * Fetch a single user by their `id`.
 * Returns: 200 OK with User if found, or 404 Not Found if no such user.
 */
router.get(
  "/:id",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id;
      const user = UserService.getOne(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/users
 * Fetch all users.
 * Returns: 200 OK with an array of User.
 */
router.get(
  "/",
  async (_req: Request, res: Response) => {
    const allUsers = UserService.getAll();
    res.json(allUsers);
  }
);

export default router;
