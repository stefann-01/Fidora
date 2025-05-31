import { Group } from "@semaphore-protocol/group";
import { NextFunction, Request, Response, Router } from "express";
import { ClaimService } from "../services/claim";

const router = Router();

/**
 * POST /api/claims/from-url
 * Creates a new claim from a tweet URL
 */
router.post("/from-url", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    
    if (typeof url !== "string") {
      res.status(400).json({ error: "URL is required and must be a string" });
      return;
    }

    const created = await ClaimService.createFromUrl(url);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      res.status(409).json({ error: err.message });
      return;
    }
    next(err);
  }
});

/**
 * POST /api/claims
 * Creates a new claim with full data
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
      !Array.isArray(payload.categories) ||
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
      categories: payload.categories,
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
