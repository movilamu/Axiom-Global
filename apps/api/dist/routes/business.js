import { Router } from "express";
import { z } from "zod";
const router = Router();
const profileStore = new Map();
const expensesStore = new Map();
const cardsStore = new Map();
function getProfile(userId) {
    if (!profileStore.has(userId)) {
        const id = `prof-${Date.now()}`;
        profileStore.set(userId, {
            id,
            userId,
            businessName: "My Business",
            category: "Other",
            monthlyLimit: 50000,
        });
    }
    return profileStore.get(userId);
}
function getExpenses(profileId) {
    if (!expensesStore.has(profileId))
        expensesStore.set(profileId, []);
    return expensesStore.get(profileId);
}
function getCards(profileId) {
    if (!cardsStore.has(profileId))
        cardsStore.set(profileId, []);
    return cardsStore.get(profileId);
}
router.get("/profile", (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const profile = getProfile(userId);
    return res.json(profile);
});
router.post("/profile", (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const profile = getProfile(userId);
    const { businessName, category, monthlyLimit } = req.body;
    if (businessName)
        profile.businessName = businessName;
    if (category)
        profile.category = category;
    if (monthlyLimit != null)
        profile.monthlyLimit = Number(monthlyLimit);
    return res.json(profile);
});
const expenseSchema = z.object({
    merchant: z.string(),
    category: z.string(),
    amount: z.union([z.number(), z.string()]).transform(Number),
    currency: z.string().default("USD"),
    date: z.string(),
    note: z.string().optional(),
});
router.get("/expenses", (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const profile = getProfile(userId);
    const expenses = getExpenses(profile.id);
    return res.json(expenses);
});
router.post("/expenses", (req, res) => {
    try {
        const userId = req.user?.id ?? "demo-user-1";
        const parsed = expenseSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid request", code: "VALIDATION_ERROR" });
        }
        const profile = getProfile(userId);
        const expenses = getExpenses(profile.id);
        const id = `exp-${Date.now()}`;
        const expense = {
            id,
            profileId: profile.id,
            ...parsed.data,
            date: parsed.data.date,
        };
        expenses.push(expense);
        return res.status(201).json(expense);
    }
    catch {
        return res.status(500).json({ error: "Something went wrong", code: "INTERNAL_ERROR" });
    }
});
router.get("/expenses/export", (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const profile = getProfile(userId);
    const expenses = getExpenses(profile.id);
    const headers = "Date,Merchant,Category,Amount,Currency,Note\n";
    const rows = expenses
        .map((e) => `${e.date},${e.merchant},${e.category},${e.amount},${e.currency},${e.note ?? ""}`)
        .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
    return res.send(headers + rows);
});
router.get("/cards", (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const profile = getProfile(userId);
    const cards = getCards(profile.id);
    return res.json(cards);
});
router.post("/cards", (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const profile = getProfile(userId);
    const cards = getCards(profile.id);
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const d = new Date();
    const id = `card-${Date.now()}`;
    const card = {
        id,
        profileId: profile.id,
        last4,
        expiryMonth: d.getMonth() + 1,
        expiryYear: d.getFullYear() + 2,
        isActive: true,
        spendLimit: req.body?.spendLimit,
    };
    cards.push(card);
    return res.status(201).json(card);
});
router.patch("/cards/:id/toggle", (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const profile = getProfile(userId);
    const cards = getCards(profile.id);
    const card = cards.find((c) => c.id === req.params.id);
    if (!card)
        return res.status(404).json({ error: "Card not found", code: "NOT_FOUND" });
    card.isActive = !card.isActive;
    return res.json(card);
});
export default router;
