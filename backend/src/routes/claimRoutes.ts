import { Router, Request, Response, NextFunction } from "express";
import { ClaimService } from "../services/claim";
import { Group } from "@semaphore-protocol/group"

const router = Router();

/**
 * POST /api/claims
 * Creates a new claim
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    if (
      typeof payload.url !== "string" ||
      typeof payload.claimId !== "string" ||
      typeof payload.author !== "string" ||
      typeof payload.content !== "string" ||
      typeof payload.category !== "string" ||
      !Array.isArray(payload.evidence)
    ) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    const newClaim = {
      url: payload.url,
      claimId: payload.claimId,
      author: payload.author,
      content: payload.content,
      category: payload.category,
      profilePic: typeof payload.profilePic === "string" ? payload.profilePic : undefined,
      evidence: payload.evidence,
      semaphore: new Group(),
    };
    const created = ClaimService.create(newClaim);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/claims/:claimId
 */
router.get("/:claimId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = ClaimService.getOne(req.params.claimId);
    if (!claim) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }
    res.json(claim);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/claims
 */
router.get("/", async (_req: Request, res: Response) => {
  const all = ClaimService.getAll();
  res.json(all);
});

export default router;
