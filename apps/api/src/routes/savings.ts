import { Router } from "express";
import { z } from "zod";

const router = Router();

const createGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  currency: z.string().default("USD"),
  emoji: z.string().optional(),
  deadline: z.string().optional(),
  autoSaveRule: z
    .object({
      frequency: z.enum(["weekly", "monthly"]),
      amount: z.number().positive(),
    })
    .optional(),
});

const depositSchema = z.object({
  amount: z.number().positive(),
});

// In-memory store for prototype (replace with Prisma when DB connected)
const goalsStore = new Map<
  string,
  {
    id: string;
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    emoji?: string;
    autoSaveRule?: { frequency: string; amount: number };
    deadline?: string;
    isCompleted: boolean;
    createdAt: string;
  }[]
>();

function getGoals(userId: string) {
  if (!goalsStore.has(userId)) goalsStore.set(userId, []);
  return goalsStore.get(userId)!;
}

router.get("/", (req, res) => {
  const userId = (req as { user?: { id: string } }).user?.id ?? "demo-user-1";
  const goals = getGoals(userId);
  return res.json(goals);
});

router.post("/", (req, res) => {
  try {
    const userId = (req as { user?: { id: string } }).user?.id ?? "demo-user-1";
    const parsed = createGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }
    const { name, targetAmount, currency, emoji, deadline, autoSaveRule } =
      parsed.data;
    const goals = getGoals(userId);
    const id = `goal-${Date.now()}`;
    const goal = {
      id,
      userId,
      name,
      targetAmount,
      currentAmount: 0,
      currency,
      emoji,
      autoSaveRule,
      deadline,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    goals.push(goal);
    return res.status(201).json(goal);
  } catch {
    return res.status(500).json({
      error: "Something went wrong",
      code: "INTERNAL_ERROR",
    });
  }
});

router.patch("/:id", (req, res) => {
  const userId = (req as { user?: { id: string } }).user?.id ?? "demo-user-1";
  const goals = getGoals(userId);
  const goal = goals.find((g) => g.id === req.params.id);
  if (!goal) {
    return res.status(404).json({ error: "Goal not found", code: "NOT_FOUND" });
  }
  const updates = req.body as Record<string, unknown>;
  if (updates.name != null) goal.name = String(updates.name);
  if (updates.targetAmount != null) goal.targetAmount = Number(updates.targetAmount);
  if (updates.emoji != null) goal.emoji = String(updates.emoji);
  if (updates.deadline != null) goal.deadline = String(updates.deadline);
  if (updates.autoSaveRule != null) goal.autoSaveRule = updates.autoSaveRule as typeof goal.autoSaveRule;
  if (updates.currentAmount != null) goal.currentAmount = Number(updates.currentAmount);
  if (updates.isCompleted != null) goal.isCompleted = Boolean(updates.isCompleted);
  return res.json(goal);
});

router.delete("/:id", (req, res) => {
  const userId = (req as { user?: { id: string } }).user?.id ?? "demo-user-1";
  const goals = getGoals(userId);
  const idx = goals.findIndex((g) => g.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Goal not found", code: "NOT_FOUND" });
  }
  goals.splice(idx, 1);
  return res.json({ ok: true });
});

router.post("/:id/deposit", (req, res) => {
  try {
    const userId = (req as { user?: { id: string } }).user?.id ?? "demo-user-1";
    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid amount",
        code: "VALIDATION_ERROR",
      });
    }
    const goals = getGoals(userId);
    const goal = goals.find((g) => g.id === req.params.id);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found", code: "NOT_FOUND" });
    }
    if (goal.isCompleted) {
      return res.status(400).json({
        error: "Goal already completed",
        code: "GOAL_COMPLETE",
      });
    }
    goal.currentAmount += parsed.data.amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    return res.json(goal);
  } catch {
    return res.status(500).json({
      error: "Something went wrong",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
