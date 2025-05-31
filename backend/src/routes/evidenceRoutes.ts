import { Router, Request, Response, NextFunction } from "express";
import { EvidenceService } from "../services/evidence";

const router = Router();

/**
 * POST /api/evidence
 */
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    if (
      typeof payload.supportsClaim !== "boolean" ||
      typeof payload.title !== "string" ||
      typeof payload.description !== "string" ||
      typeof payload.wellStructuredPercentage !== "number"
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const created = EvidenceService.create({
      supportsClaim: payload.supportsClaim,
      title: payload.title,
      description: payload.description,
      wellStructuredPercentage: payload.wellStructuredPercentage,
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/evidence/:id
 */
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const ev = EvidenceService.getOne(req.params.id);
    if (!ev) {
      return res.status(404).json({ error: "Evidence not found" });
    }
    return res.json(ev);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/evidence
 */
router.get("/", (_req: Request, res: Response) => {
  const all = EvidenceService.getAll();
  res.json(all);
});

export default router;
