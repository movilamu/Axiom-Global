import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export interface SavingsGoal {
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
}

export function useSavingsGoals() {
  return useQuery({
    queryKey: ["savings-goals"],
    queryFn: () => api.get<SavingsGoal[]>("/api/savings"),
  });
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      targetAmount: number;
      currency: string;
      emoji?: string;
      deadline?: string;
      autoSaveRule?: { frequency: string; amount: number };
    }) => api.post<SavingsGoal>("/api/savings", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings-goals"] }),
  });
}

export function useDepositToGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post<SavingsGoal>(`/api/savings/${id}/deposit`, { amount }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings-goals"] }),
  });
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/savings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings-goals"] }),
  });
}
