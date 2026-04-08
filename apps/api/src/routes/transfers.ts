import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    // TODO: verifyJWT, validate with Zod, persist via Prisma
    return res.json({ ok: true, id: `txn-${Date.now()}` });
  } catch {
    return res.status(500).json({
      error: "Something went wrong",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
