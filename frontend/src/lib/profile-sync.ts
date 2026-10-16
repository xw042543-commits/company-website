const key = "udajo:profile-version";
export function announceProfileUpdate() {
  window.dispatchEvent(new Event(key));
  try { localStorage.setItem(key, crypto.randomUUID()); } catch { /* Disabled browser storage still allows same-tab updates. */ }
}
export function watchProfileUpdates(refresh: () => void) {
  const reload = () => { if (!document.hidden) refresh(); };
  const storage = (event: StorageEvent) => { if (event.key === key) reload(); };
  window.addEventListener(key, reload);
  window.addEventListener("storage", storage);
  window.addEventListener("focus", reload);
  document.addEventListener("visibilitychange", reload);
  const timer = window.setInterval(reload, 5000);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener(key, reload);
    window.removeEventListener("storage", storage);
    window.removeEventListener("focus", reload);
    document.removeEventListener("visibilitychange", reload);
  };
}
export function isSafeProfileAvatar(value: string) {
  try {
    const url = new URL(value, "https://yangdoujiao.com");
    if (url.username || url.password || url.hash) return false;
    if (url.protocol === "https:" && (url.hostname === "qlogo.cn" || url.hostname.endsWith(".qlogo.cn"))) return true;
    const owned = url.origin === "https://yangdoujiao.com" || url.origin === "https://www.yangdoujiao.com"
      || (process.env.NODE_ENV !== "production" && ["http://localhost:8080", "http://127.0.0.1:8080"].includes(url.origin));
    return owned && /^\/api\/v1\/miniapp\/avatars\/[1-9]\d*$/.test(url.pathname) && /^[\w-]+$/.test(url.searchParams.get("v") ?? "");
  } catch { return false; }
}
