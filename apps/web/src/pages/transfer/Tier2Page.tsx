import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { KBA_QUESTIONS } from "../../lib/kba";
import { AppLayout } from "../../components/layout/AppLayout";

export function Tier2Page() {
  const navigate = useAppNavigate();
  const {
    kbaQuestions,
    setKbaQuestions,
    kbaAnswers,
    addKbaAnswer,
    setKbaAnswers,
    appendAuditLog,
    riskScore,
  } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showEscalation, setShowEscalation] = useState(false);

  useEffect(() => {
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    setKbaQuestions(shuffled);
  }, [setKbaQuestions]);

  const question = kbaQuestions[currentIndex] !== undefined
    ? KBA_QUESTIONS[kbaQuestions[currentIndex]]
    : null;

  const options = useMemo(() => {
    if (!question) return [];
    const correct = question.answer();
    const all = [correct, ...question.distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [question]);

  const handleNext = () => {
    if (selectedAnswer) {
      const isEditing = currentIndex < kbaAnswers.length;
      const answers = isEditing
        ? kbaAnswers.map((a, i) => (i === currentIndex ? selectedAnswer : a))
        : [...kbaAnswers, selectedAnswer];
      if (isEditing) {
        setKbaAnswers(answers);
      } else {
        addKbaAnswer(selectedAnswer);
      }
      if (currentIndex < kbaQuestions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
      } else {
        const correctCount = kbaQuestions.reduce((count, qIdx, i) => {
          const q = KBA_QUESTIONS[qIdx];
          return count + (q.answer() === answers[i] ? 1 : 0);
        }, 0);

        if (correctCount >= 2) {
          appendAuditLog({
            id: `audit-${Date.now()}`,
            sessionId: useAppStore.getState().sessionId,
            action: "TRANSFER",
            riskScore: riskScore ?? 0,
            riskTier: 2,
            riskFactors: [],
            outcome: "KBA_PASSED",
            timestamp: new Date().toUTCString(),
            transferDetails: useAppStore.getState().transferDetails,
          });
          navigate("tier1");
        } else {
          appendAuditLog({
            id: `audit-${Date.now()}`,
            sessionId: useAppStore.getState().sessionId,
            action: "TRANSFER",
            riskScore: riskScore ?? 0,
            riskTier: 2,
            riskFactors: [],
            outcome: "KBA_FAILED",
            timestamp: new Date().toUTCString(),
            transferDetails: useAppStore.getState().transferDetails,
          });
          setShowEscalation(true);
          setTimeout(() => navigate("tier3"), 2000);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelectedAnswer(kbaAnswers[currentIndex - 1] ?? null);
    }
  };

  if (showEscalation) {
    return (
      <AppLayout>
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <p className="text-center text-lg">{STRINGS.en.kba.escalation}</p>
        </div>
      </AppLayout>
    );
  }

  if (!question) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading…</p>
        </div>
      </AppLayout>
    );
  }

  const isLastQuestion = currentIndex === kbaQuestions.length - 1;

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl p-6">
        <h1 className="mb-2 font-syne text-2xl font-bold">{STRINGS.en.kba.heading}</h1>
        <p className="mb-6 text-[var(--text-secondary)]">{STRINGS.en.kba.subtext}</p>
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          {STRINGS.en.kba.progress
            .replace("{current}", String(currentIndex + 1))
            .replace("{total}", String(kbaQuestions.length))}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg font-medium">{question.text}</p>
            <div className="grid gap-3">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedAnswer(opt)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    selectedAnswer === opt
                      ? "border-[var(--teal)] bg-[var(--teal)]/10"
                      : "border-[var(--border)] hover:border-[var(--teal)]/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex gap-4">
          {currentIndex > 0 && (
            <button type="button" className="btn-ghost" onClick={handleBack}>
              ← {STRINGS.en.kba.back}
            </button>
          )}
          {selectedAnswer && (
            <motion.button
              type="button"
              className="btn-primary"
              onClick={handleNext}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isLastQuestion ? STRINGS.en.kba.confirm : `${STRINGS.en.kba.next} →`}
            </motion.button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
