import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "./store/appStore";
import { pathToPage } from "./lib/routes";
import { LoginPage } from "./pages/auth/LoginPage";
import { OTPPage } from "./pages/auth/OTPPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { TransferPage } from "./pages/transfer/TransferPage";
import { AssessingPage } from "./pages/transfer/AssessingPage";
import { Tier1Page } from "./pages/transfer/Tier1Page";
import { Tier2Page } from "./pages/transfer/Tier2Page";
import { Tier3Page } from "./pages/transfer/Tier3Page";
import { DeniedPage } from "./pages/transfer/DeniedPage";
import { SavingsPage } from "./pages/savings/SavingsPage";
import { CryptoPage } from "./pages/crypto/CryptoPage";
import { BusinessPage } from "./pages/business/BusinessPage";
import { SecurityPage } from "./pages/security/SecurityPage";

const PROTECTED_PATHS = ["/dashboard", "/transfer", "/savings", "/crypto", "/business", "/security"];
const AUTH_PATHS = ["/login", "/signup", "/otp"];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, page, setPageFromUrl } = useAppStore();
  const initialSync = useRef(false);

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, "") || "/";
    const derivedPage = pathToPage(path);

    if (!initialSync.current) {
      initialSync.current = true;
      if (path === "/") {
        navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
        setPageFromUrl(isAuthenticated ? "dashboard" : "auth/login");
        return;
      }
      if (isAuthenticated && AUTH_PATHS.includes(path)) {
        navigate("/dashboard", { replace: true });
        setPageFromUrl("dashboard");
        return;
      }
      if (!isAuthenticated && PROTECTED_PATHS.some((p) => path.startsWith(p))) {
        navigate("/login", { replace: true });
        setPageFromUrl("auth/login");
        return;
      }
    }

    if (derivedPage) {
      setPageFromUrl(derivedPage as Parameters<typeof setPageFromUrl>[0]);
    } else if (path !== "/") {
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
      setPageFromUrl(isAuthenticated ? "dashboard" : "auth/login");
    }
  }, [location.pathname, isAuthenticated, navigate, setPageFromUrl]);

  if (!isAuthenticated) {
    if (page === "auth/signup") return <SignupPage />;
    if (page === "auth/otp") return <OTPPage />;
    return <LoginPage />;
  }

  switch (page) {
    case "dashboard":
      return <DashboardPage />;
    case "transfer":
      return <TransferPage />;
    case "assessing":
      return <AssessingPage />;
    case "tier1":
      return <Tier1Page />;
    case "tier2":
      return <Tier2Page />;
    case "tier3":
      return <Tier3Page />;
    case "denied":
      return <DeniedPage />;
    case "savings":
      return <SavingsPage />;
    case "crypto":
      return <CryptoPage />;
    case "business":
      return <BusinessPage />;
    case "security":
      return <SecurityPage />;
    default:
      return <DashboardPage />;
  }
}

export default App;
