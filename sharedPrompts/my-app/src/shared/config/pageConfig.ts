/* ================================
 * Page UI Configuration
 * ================================ */

export interface FloatingButtonConfig {
  icon: "plus" | "edit";
  action: string;
}

export interface PageUIConfig {
  header: boolean;
  footer: boolean;
  floatingButton?: FloatingButtonConfig;
}

export const PAGE_UI_CONFIG: Record<string, PageUIConfig> = {
  // Landing
  "/": { header: false, footer: true },

  // Auth
  "/login": { header: false, footer: false },
  "/signup": { header: false, footer: false },
  "/auth/verify": { header: false, footer: false },
  "/auth/forgot-password": { header: false, footer: false },
  "/auth/success": { header: false, footer: false }, // 추가

  // Feed
  "/feed": {
    header: true,
    footer: false,
    floatingButton: { icon: "plus", action: "/prompts/new" },
  },

  // Prompt
  "/prompts/new": { header: true, footer: false },
  "/prompts/:id": { header: true, footer: false },
  "/prompts/:id/edit": { header: true, footer: false },
  "/prompts/me": {
    header: true,
    footer: false,
    floatingButton: { icon: "plus", action: "/prompts/new" },
  },

  // User
  "/profile": { header: true, footer: false },
  "/settings": { header: true, footer: false },
  "/users/:id": { header: true, footer: false },

  // Search / Activity
  "/search": { header: true, footer: false },
  "/bookmarks": { header: true, footer: false },
  "/notifications": { header: true, footer: false },

  // Admin
  "/admin": { header: true, footer: false },
  "/admin/users": { header: true, footer: false },
  "/admin/prompts": { header: true, footer: false },
  "/admin/reports": { header: true, footer: false },
};

/* ================================
 * Page Title Config
 * ================================ */

export const PAGE_TITLE_CONFIG: Record<string, string> = {
  "/": "PromptHub",
  "/login": "로그인",
  "/signup": "회원가입",
  "/auth/verify": "이메일 인증",
  "/auth/forgot-password": "비밀번호 찾기",
  "/auth/success": "OAuth 로그인 처리 중...", // 추가

  "/feed": "홈",
  "/prompts/new": "새 프롬프트",
  "/prompts/:id": "프롬프트 상세",
  "/prompts/:id/edit": "프롬프트 수정",
  "/prompts/me": "내 프롬프트",

  "/profile": "프로필",
  "/settings": "설정",
  "/users/:id": "사용자 프로필",

  "/search": "검색",
  "/bookmarks": "북마크",
  "/notifications": "알림",

  "/admin": "관리자 대시보드",
  "/admin/users": "사용자 관리",
  "/admin/prompts": "프롬프트 관리",
  "/admin/reports": "신고 관리",
};

/* ================================
 * Header Config (Exceptions only)
 * ================================ */

export const HEADER_CONFIG: Record<
  string,
  Partial<{
    showLogo: boolean;
    showSearch: boolean;
    showNotifications: boolean;
    showProfile: boolean;
    transparent: boolean;
  }>
> = {
  "/feed": { showLogo: true, showSearch: true, showNotifications: true, showProfile: true },
  "/prompts/new": { showLogo: false },
  "/prompts/:id": { showLogo: false },
};

/* ================================
 * OAuth2 Config
 * ================================ */

export const OAUTH2_CONFIG = {
  FAILURE_REDIRECT_URL: "/login?error=oauth", // 변경: 실제 프론트 라우트
  SUCCESS_REDIRECT_URL: "/auth/success",     // 변경: OAuthSuccessPage와 맞춤
};
