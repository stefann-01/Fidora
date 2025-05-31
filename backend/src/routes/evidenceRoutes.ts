import { NextFunction, Request, Response, Router } from "express";
import { EvidenceService } from "../services/evidence";

const router = Router();

/**
 * POST /api/evidence
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    if (
      typeof payload.supportsClaim !== "boolean" ||
      typeof payload.title !== "string" ||
      typeof payload.description !== "string" ||
      typeof payload.wellStructuredPercentage !== "number"
    ) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    const created = await EvidenceService.create({
      supportsClaim: payload.supportsClaim,
      title: payload.title,
      description: payload.description,
      wellStructuredPercentage: payload.wellStructuredPercentage,
      statement: payload.statement,
    });
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
});

/**
 * GET /api/evidence/:id
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ev = EvidenceService.getOne(req.params.id);
    if (!ev) {
      res.status(404).json({ error: "Evidence not found" });
      return;
    }
    res.json(ev);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/evidence
 */
router.get("/", async (_req: Request, res: Response) => {
  const all = EvidenceService.getAll();
  res.json(all);
});

export default router;
