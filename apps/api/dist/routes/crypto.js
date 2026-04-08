import { Router } from "express";
import { z } from "zod";
const router = Router();
let pricesCache = null;
const CACHE_MS = 60000;
const FALLBACK_PRICES = [
    { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "", current_price: 67000, price_change_percentage_24h: 2.5, market_cap: 0, sparkline_in_7d: { price: [] } },
    { id: "ethereum", symbol: "eth", name: "Ethereum", image: "", current_price: 3500, price_change_percentage_24h: 1.2, market_cap: 0, sparkline_in_7d: { price: [] } },
    { id: "solana", symbol: "sol", name: "Solana", image: "", current_price: 180, price_change_percentage_24h: 4.1, market_cap: 0, sparkline_in_7d: { price: [] } },
];
async function fetchPrices() {
    if (pricesCache && Date.now() - pricesCache.ts < CACHE_MS) {
        return pricesCache.data;
    }
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,solana,bnb,xrp,usdc,cardano,avalanche-2,dogecoin,chainlink,polkadot,polygon,litecoin&sparkline=true&price_change_percentage=24h");
        if (!res.ok)
            throw new Error("CoinGecko error");
        const data = (await res.json());
        if (!Array.isArray(data))
            throw new Error("Invalid response");
        pricesCache = { data, ts: Date.now() };
        return data;
    }
    catch {
        return pricesCache?.data ?? FALLBACK_PRICES;
    }
}
const holdingsStore = new Map();
function getHoldings(userId) {
    if (!holdingsStore.has(userId))
        holdingsStore.set(userId, []);
    return holdingsStore.get(userId);
}
router.get("/prices", async (_req, res) => {
    try {
        const data = await fetchPrices();
        return res.json(data);
    }
    catch {
        return res.status(500).json({
            error: "Failed to fetch prices",
            code: "FETCH_ERROR",
        });
    }
});
router.get("/holdings", async (req, res) => {
    const userId = req.user?.id ?? "demo-user-1";
    const holdings = getHoldings(userId);
    const prices = await fetchPrices();
    const priceMap = new Map(prices.map((p) => [p.id, p]));
    const enriched = holdings.map((h) => {
        const coin = priceMap.get(h.coinId);
        const currentPrice = coin?.current_price ?? h.avgBuyPrice;
        const totalValue = h.quantity * currentPrice;
        const costBasis = h.quantity * h.avgBuyPrice;
        const pnl = ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
        const pnlAbs = totalValue - costBasis;
        return {
            ...h,
            currentPrice,
            totalValue,
            pnl,
            pnlAbs,
            priceChange24h: coin?.price_change_percentage_24h ?? 0,
            sparkline: coin?.sparkline_in_7d?.price ?? [],
        };
    });
    return res.json(enriched);
});
const buySchema = z.object({
    coinId: z.string(),
    amount: z.union([z.number(), z.string()]).transform((v) => Number(v)),
});
const sellSchema = z.object({
    coinId: z.string(),
    quantity: z.union([z.number(), z.string()]).transform((v) => Number(v)),
});
router.post("/buy", async (req, res) => {
    try {
        const userId = req.user?.id ?? "demo-user-1";
        const parsed = buySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request",
                code: "VALIDATION_ERROR",
            });
        }
        const { coinId, amount } = parsed.data;
        if (amount <= 0) {
            return res.status(400).json({
                error: "Amount must be positive",
                code: "VALIDATION_ERROR",
            });
        }
        const prices = await fetchPrices();
        const coin = prices.find((p) => p.id === coinId);
        if (!coin) {
            return res.status(400).json({
                error: "Coin not found",
                code: "NOT_FOUND",
            });
        }
        const quantity = amount / coin.current_price;
        const holdings = getHoldings(userId);
        const existing = holdings.find((h) => h.coinId === coinId);
        if (existing) {
            const newTotalQty = existing.quantity + quantity;
            const newAvg = (existing.avgBuyPrice * existing.quantity +
                coin.current_price * quantity) /
                newTotalQty;
            existing.quantity = newTotalQty;
            existing.avgBuyPrice = newAvg;
            return res.json(existing);
        }
        const id = `hold-${Date.now()}`;
        const holding = {
            id,
            userId,
            coinId,
            symbol: coin.symbol,
            quantity,
            avgBuyPrice: coin.current_price,
            createdAt: new Date().toISOString(),
        };
        holdings.push(holding);
        return res.status(201).json(holding);
    }
    catch {
        return res.status(500).json({
            error: "Something went wrong",
            code: "INTERNAL_ERROR",
        });
    }
});
router.post("/sell", async (req, res) => {
    try {
        const userId = req.user?.id ?? "demo-user-1";
        const parsed = sellSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request",
                code: "VALIDATION_ERROR",
            });
        }
        const { coinId, quantity } = parsed.data;
        if (quantity <= 0) {
            return res.status(400).json({
                error: "Quantity must be positive",
                code: "VALIDATION_ERROR",
            });
        }
        const holdings = getHoldings(userId);
        const existing = holdings.find((h) => h.coinId === coinId);
        if (!existing) {
            return res.status(400).json({
                error: "No holding for this coin",
                code: "NOT_FOUND",
            });
        }
        if (quantity > existing.quantity) {
            return res.status(400).json({
                error: "Insufficient quantity",
                code: "INSUFFICIENT",
            });
        }
        existing.quantity -= quantity;
        if (existing.quantity <= 0) {
            const idx = holdings.indexOf(existing);
            holdings.splice(idx, 1);
            return res.json({ sold: quantity, remaining: null });
        }
        return res.json({ sold: quantity, remaining: existing });
    }
    catch {
        return res.status(500).json({
            error: "Something went wrong",
            code: "INTERNAL_ERROR",
        });
    }
});
export default router;
