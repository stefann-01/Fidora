import { Router, Request, Response, NextFunction } from "express";
import { ClaimService } from "../services/claim";

const router = Router();

/**
 * POST /api/claims
 * Creates a new claim
 */
router.post("/", (req: Request, res: Response, next: NextFunction) => {
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
      return res.status(400).json({ error: "Invalid payload" });
    }

    const newClaim = {
      url: payload.url,
      claimId: payload.claimId,
      author: payload.author,
      content: payload.content,
      category: payload.category,
      profilePic: typeof payload.profilePic === "string" ? payload.profilePic : undefined,
      evidence: payload.evidence,
    };
    const created = ClaimService.create(newClaim);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/claims/:claimId
 */
router.get("/:claimId", (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = ClaimService.getOne(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }
    return res.json(claim);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/claims
 */
router.get("/", (_req: Request, res: Response) => {
  const all = ClaimService.getAll();
  res.json(all);
});

export default router;
