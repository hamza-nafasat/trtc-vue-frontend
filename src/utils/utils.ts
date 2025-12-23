export function getUrlParam(key: string): string {
  const url = decodeURI(window.location.href.replace(/^[^?]*\?/, ""));
  const regexp = new RegExp(`(^|&)${key}=([^&#]*)(&|$|)`, "i");
  const paramMatch = url.match(regexp);

  return paramMatch ? paramMatch[2] : "";
}

export function getLanguage(localStorageLangId = "trtc-v5-quick-demo-vue3-ts") {
  let lang =
    getParamKey("lang") || localStorage.getItem(localStorageLangId) || window.navigator.language?.toLowerCase();
  lang = lang.indexOf("zh") > -1 ? "zh-cn" : "en";
  return lang;
}

export const getParamKey: any = (key: string) => {
  if (getUrlParam(key)) {
    return getUrlParam(key);
  }
  switch (key) {
    case "userId":
      return `user_${Math.floor(Math.random() * 100000000)}`;
    case "strRoomId":
      return `room_${Math.floor(Math.random() * 100000)}`;
    case "sdkAppId":
      return undefined;
    case "sdkSecretKey":
      return undefined;
    default:
      return undefined;
  }
};

export const isMobile: boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

/**
 * Get API URL with proper HTTPS protocol enforcement
 * Ensures no mixed content issues in production
 * 
 * Rules:
 * - If page is loaded over HTTPS, ALL API URLs must be HTTPS
 * - If page is loaded over HTTP (dev), HTTP is allowed
 * - Automatically converts HTTP to HTTPS when needed
 */
export function getApiUrl(): string {
  // Get API URL from environment variable
  const envUrl = import.meta.env.VITE_API_URL;

  // Check if we're in production (HTTPS page)
  const isProduction = window.location.protocol === "https:";

  // If no env URL is set
  if (!envUrl || envUrl.trim() === "") {
    if (isProduction) {
      // In production, we MUST have VITE_API_URL set
      console.error("❌ VITE_API_URL is not set! Please configure it in Vercel environment variables.");
      // Fallback: try to construct from current origin (not recommended)
      return window.location.origin;
    }
    // In development, allow HTTP localhost
    return "http://localhost:3000";
  }

  // If env URL is provided, ensure it uses HTTPS in production
  let apiUrl = envUrl.trim();

  // CRITICAL: If page is HTTPS but API URL is HTTP, convert to HTTPS
  // This prevents mixed content warnings
  if (isProduction && apiUrl.startsWith("http://")) {
    apiUrl = apiUrl.replace("http://", "https://");
    console.warn("⚠️ Mixed content prevented: HTTP API URL converted to HTTPS:", apiUrl);
  }

  // If page is HTTP (development), allow HTTP API URL
  // But still prefer HTTPS if the URL already uses it
  return apiUrl;
}
