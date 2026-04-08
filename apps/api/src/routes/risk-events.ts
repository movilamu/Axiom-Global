import { Router } from "express";

const router = Router();

const eventsStore: Array<{
  id: string;
  userId: string;
  sessionId: string;
  action: string;
  riskScore: number;
  riskTier: number;
  riskFactors: string[];
  outcome: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}> = [];

router.get("/", (req, res) => {
  const userId = (req as { user?: { id: string } }).user?.id ?? "demo-user-1";
  const userEvents = eventsStore.filter((e) => e.userId === userId);
  return res.json(userEvents);
});

router.post("/", (req, res) => {
  try {
    const userId = (req as { user?: { id: string } }).user?.id ?? "demo-user-1";
    const { sessionId, action, riskScore, riskTier, riskFactors, outcome, metadata } = req.body;
    const id = `evt-${Date.now()}`;
    const event = {
      id,
      userId,
      sessionId,
      action,
      riskScore,
      riskTier,
      riskFactors: riskFactors ?? [],
      outcome,
      createdAt: new Date().toISOString(),
      metadata,
    };
    eventsStore.push(event);
    return res.json({ ok: true, id });
  } catch {
    return res.status(500).json({
      error: "Something went wrong",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
