import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { pageToPath } from "./routes";
import { useCallback } from "react";

export function useAppNavigate() {
  const navigate = useNavigate();
  const storeNavigate = useAppStore((s) => s.navigate);

  return useCallback(
    (page: Parameters<typeof storeNavigate>[0], replace?: boolean) => {
      storeNavigate(page);
      navigate(pageToPath(page), { replace: !!replace });
    },
    [navigate, storeNavigate]
  );
}
