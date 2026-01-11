import { useNavigate, useLocation, matchPath } from "react-router-dom";
import FloatingButton from "@/shared/components/FloatingButton";
import { PAGE_UI_CONFIG } from "@/shared/config/pageConfig";

function getMatchedConfig<T>(map: Record<string, T>, path: string): T | null {
  for (const [pattern, value] of Object.entries(map)) {
    if (matchPath({ path: pattern, end: true }, path)) {
      return value;
    }
  }
  return null;
}

export default function FloatingButtonManager() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const config = getMatchedConfig(PAGE_UI_CONFIG, pathname);

  if (!config?.floatingButton) return null;

  const { icon, action } = config.floatingButton;

  return (
    <FloatingButton
      iconType={icon}
      onClick={() => navigate(action)}
    />
  );
}
