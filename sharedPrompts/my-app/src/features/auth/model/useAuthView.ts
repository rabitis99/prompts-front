import { useState } from "react";

export type AuthView = "login" | "forgot" | "verify";

export function useAuthView() {
  const [currentView, setCurrentView] = useState<AuthView>("login");

  return {
    currentView,
    setView: setCurrentView,
  };
}
