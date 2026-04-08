import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useAppStore } from "../../store/appStore";
import { STRINGS } from "../../lib/i18n";
import { AppLayout } from "../../components/layout/AppLayout";
import { api } from "../../lib/api/client";

interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
}

interface Holding {
  id: string;
  coinId: string;
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlAbs: number;
  priceChange24h: number;
  sparkline: number[];
}

export function CryptoPage() {
  const { locale } = useAppStore();
  const qc = useQueryClient();

  const { data: prices = [] } = useQuery({
    queryKey: ["crypto-prices"],
    queryFn: () => api.get<CoinPrice[]>("/api/crypto/prices"),
    refetchInterval: 60_000,
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ["crypto-holdings"],
    queryFn: () => api.get<Holding[]>("/api/crypto/holdings"),
  });

  const buyMutation = useMutation({
    mutationFn: (body: { coinId: string; amount: number }) =>
      api.post("/api/crypto/buy", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crypto-holdings"] }),
  });

  const sellMutation = useMutation({
    mutationFn: (body: { coinId: string; quantity: number }) =>
      api.post("/api/crypto/sell", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crypto-holdings"] }),
  });

  const totalValue = holdings.reduce((s, h) => s + h.totalValue, 0);
  const totalPnl = holdings.reduce((s, h) => s + h.pnlAbs, 0);
  const pnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  const [showBuySell, setShowBuySell] = useState<"buy" | "sell" | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinPrice | Holding | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"usd" | "qty">("usd");

  const formatAmount = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(n);

  const pieData = holdings.map((h, i) => ({
    name: h.symbol,
    value: h.totalValue,
    color: ["var(--purple)", "var(--teal)", "var(--orange)", "var(--pink)"][
      i % 4
    ],
  }));

  const handleBuy = () => {
    if (!selectedCoin || !amount) return;
    const amt = parseFloat(amount);
    if (amt <= 0) return;
    const coinId =
      "coinId" in selectedCoin
        ? (selectedCoin as Holding).coinId
        : (selectedCoin as CoinPrice).id;
    buyMutation.mutate(
      { coinId, amount: amt },
      { onSuccess: () => setShowBuySell(null) }
    );
  };

  const handleSell = () => {
    if (!selectedCoin || !amount) return;
    const holding = holdings.find(
      (h) =>
        h.coinId === ("coinId" in selectedCoin ? selectedCoin.coinId : selectedCoin.id)
    );
    if (!holding) return;
    const qty = mode === "usd" ? parseFloat(amount) / holding.currentPrice : parseFloat(amount);
    if (qty <= 0 || qty > holding.quantity) return;
    sellMutation.mutate(
      { coinId: holding.coinId, quantity: qty },
      { onSuccess: () => setShowBuySell(null) }
    );
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <div
          className="orb absolute -right-20 -top-20 h-[400px] w-[400px] opacity-20"
          style={{ background: "var(--orange)" }}
        />
        <div
          className="orb absolute -bottom-20 -left-20 h-[400px] w-[400px] opacity-20"
          style={{ background: "var(--purple)" }}
        />

        <h1 className="mb-2 font-syne text-4xl font-bold lg:text-5xl">
          {STRINGS.en.crypto.title}
        </h1>
        <p className="mb-8 text-[var(--text-secondary)]">
          {STRINGS.en.crypto.portfolio}
        </p>

        <motion.div
          className="glass-card-bright relative mb-8 flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="mb-1 text-sm text-[var(--text-secondary)]">
              Total Portfolio Value
            </p>
            <p className="font-dm-mono text-4xl font-extrabold lg:text-5xl">
              {formatAmount(totalValue)}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                pnlPercent >= 0
                  ? "bg-[var(--emerald)]/20 text-[var(--emerald)]"
                  : "bg-[var(--coral)]/20 text-[var(--coral)]"
              }`}
            >
              {pnlPercent >= 0 ? "+" : ""}
              {pnlPercent.toFixed(2)}% ({formatAmount(totalPnl)})
            </span>
          </div>
          {holdings.length > 0 && (
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <h2 className="mb-4 font-syne text-xl font-bold">
          {STRINGS.en.crypto.holdings}
        </h2>
        <div className="mb-12 space-y-4">
          {holdings.map((h) => (
            <motion.div
              key={h.id}
              className="glass-card flex flex-wrap items-center justify-between gap-4 p-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    prices.find((p) => p.id === h.coinId)?.image ??
                    `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`
                  }
                  alt={h.symbol}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-syne font-semibold">{h.symbol.toUpperCase()}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {h.quantity.toFixed(6)} {h.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-end">
                  <p className="font-dm-mono font-medium">
                    {formatAmount(h.currentPrice)}
                  </p>
                  <p className="font-dm-mono text-lg font-semibold">
                    {formatAmount(h.totalValue)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    h.pnl >= 0
                      ? "bg-[var(--emerald)]/20 text-[var(--emerald)]"
                      : "bg-[var(--coral)]/20 text-[var(--coral)]"
                  }`}
                >
                  {h.pnl >= 0 ? "+" : ""}
                  {h.pnl.toFixed(2)}%
                </span>
                {h.sparkline.length > 0 && (
                  <div className="h-10 w-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={h.sparkline.map((p, i) => ({ v: p, i }))}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={
                            h.pnl >= 0 ? "var(--emerald)" : "var(--coral)"
                          }
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-primary py-2 text-sm"
                    onClick={() => {
                      setSelectedCoin(h);
                      setShowBuySell("buy");
                      setAmount("");
                    }}
                  >
                    {STRINGS.en.crypto.buy}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost py-2 text-sm"
                    onClick={() => {
                      setSelectedCoin(h);
                      setShowBuySell("sell");
                      setAmount("");
                    }}
                  >
                    {STRINGS.en.crypto.sell}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <h2 className="mb-4 font-syne text-xl font-bold">
          {STRINGS.en.crypto.marketPrice}
        </h2>
        <div className="space-y-3">
          {prices.slice(0, 10).map((coin) => (
            <div
              key={coin.id}
              className="glass-card flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={coin.image}
                  alt={coin.symbol}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="font-medium">{coin.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-dm-mono">{formatAmount(coin.current_price)}</p>
                <span
                  className={`text-sm ${
                    (coin.price_change_percentage_24h ?? 0) >= 0
                      ? "text-[var(--emerald)]"
                      : "text-[var(--coral)]"
                  }`}
                >
                  {(coin.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                  {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                </span>
                <button
                  type="button"
                  className="btn-primary py-2 text-sm"
                  onClick={() => {
                    setSelectedCoin(coin);
                    setShowBuySell("buy");
                    setAmount("");
                  }}
                >
                  {STRINGS.en.crypto.buy}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBuySell && selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-card-bright w-full max-w-md p-6">
            <h3 className="mb-4 font-syne text-xl font-bold">
              {showBuySell === "buy" ? STRINGS.en.crypto.buy : STRINGS.en.crypto.sell}{" "}
              {("symbol" in selectedCoin
                ? (selectedCoin as { symbol: string }).symbol
                : (selectedCoin as Holding).symbol)?.toUpperCase() ?? ""}
            </h3>
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded-lg py-2 ${
                  mode === "usd" ? "bg-[var(--teal)]/20" : "bg-[var(--glass-1)]"
                }`}
                onClick={() => setMode("usd")}
              >
                USD
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg py-2 ${
                  mode === "qty" ? "bg-[var(--teal)]/20" : "bg-[var(--glass-1)]"
                }`}
                onClick={() => setMode("qty")}
              >
                Quantity
              </button>
            </div>
            <input
              type="number"
              className="input-base mb-4"
              placeholder={mode === "usd" ? "0.00 USD" : "0.000000"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {showBuySell === "sell" &&
              "quantity" in selectedCoin &&
              (selectedCoin as Holding).quantity > 0 && (
                <p className="mb-4 text-sm text-[var(--text-secondary)]">
                  Max: {(selectedCoin as Holding).quantity.toFixed(6)}{" "}
                  {(selectedCoin as Holding).symbol}
                </p>
              )}
            {amount &&
              parseFloat(amount) > 500 &&
              showBuySell === "buy" && (
                <p className="mb-4 text-xs text-[var(--amber)]">
                  SilentSentinel will run for amounts above $500
                </p>
              )}
            <div className="flex gap-4">
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => setShowBuySell(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={showBuySell === "buy" ? handleBuy : handleSell}
                disabled={
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  buyMutation.isPending ||
                  sellMutation.isPending
                }
              >
                {showBuySell === "buy"
                  ? buyMutation.isPending
                    ? "Buying…"
                    : "Buy"
                  : sellMutation.isPending
                    ? "Selling…"
                    : "Sell"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.disclaimer}
      </p>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.privacyFooter}
      </p>
    </AppLayout>
  );
}
