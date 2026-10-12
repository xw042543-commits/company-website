"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getWechatQrConfig, type WechatQrConfig } from "@/lib/auth-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

const WECHAT_LOGIN_SCRIPT = "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
const CONTAINER_ID = "wechat-login-container";

type WxLoginOptions = {
  self_redirect: boolean;
  id: string;
  appid: string;
  scope: "snsapi_login";
  redirect_uri: string;
  state: string;
  style: "black";
  stylelite: 1;
  href: string;
};

declare global {
  interface Window {
    WxLogin?: new (options: WxLoginOptions) => unknown;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadWechatLoginScript(): Promise<void> {
  if (window.WxLogin) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  const loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WECHAT_LOGIN_SCRIPT}"]`);
    existing?.remove();
    const script = document.createElement("script");
    script.addEventListener("load", () => window.WxLogin ? resolve() : reject(new Error("WxLogin unavailable")), { once: true });
    script.addEventListener("error", () => {
      script.remove();
      reject(new Error("WxLogin failed to load"));
    }, { once: true });
    script.src = WECHAT_LOGIN_SCRIPT;
    script.async = true;
    document.head.appendChild(script);
  });
  const result = loading.catch(error => {
    scriptPromise = null;
    throw error;
  });
  scriptPromise = result;
  return result;
}

function mountWechatLogin(config: WechatQrConfig, onConfirmation: () => void): Promise<void> {
  const container = document.getElementById(CONTAINER_ID);
  if (!container || !window.WxLogin) throw new Error("WeChat login container unavailable");
  container.replaceChildren();
  new window.WxLogin({
    self_redirect: false,
    id: CONTAINER_ID,
    appid: config.appId,
    scope: config.scope,
    redirect_uri: encodeURIComponent(config.redirectUri),
    state: config.state,
    style: "black",
    stylelite: 1,
    href: "",
  });
  return new Promise((resolve, reject) => {
    let observer: MutationObserver | null = null;
    const timeout = window.setTimeout(() => finish(new Error("WeChat QR iframe timed out")), 12_000);
    const finish = (error?: Error) => {
      window.clearTimeout(timeout);
      observer?.disconnect();
      if (error) reject(error); else resolve();
    };
    const watch = (iframe: HTMLIFrameElement) => {
      let initialLoadComplete = false;
      iframe.addEventListener("load", () => {
        if (!initialLoadComplete) {
          initialLoadComplete = true;
          finish();
          return;
        }
        onConfirmation();
      });
      iframe.addEventListener("error", () => finish(new Error("WeChat QR iframe failed")), { once: true });
    };
    const iframe = container.querySelector<HTMLIFrameElement>("iframe");
    if (iframe) {
      watch(iframe);
      return;
    }
    observer = new MutationObserver(() => {
      const injected = container.querySelector<HTMLIFrameElement>("iframe");
      if (injected) {
        observer?.disconnect();
        watch(injected);
      }
    });
    observer.observe(container, { childList: true, subtree: true });
  });
}

export function WechatQrPanel({ locale, returnTo: requestedReturnTo }: {
  locale: Locale;
  returnTo?: string;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [confirming, setConfirming] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnTo = requestedReturnTo ?? `/${locale}/account`;
  const dismissConfirmation = useCallback(() => {
    setConfirming(false);
    setStatus("loading");
    setRetryNonce(value => value + 1);
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.all([
      getWechatQrConfig(browserApiBaseUrl(), locale, returnTo),
      loadWechatLoginScript(),
    ]).then(([result]) => {
      if (!active) return;
      if (result.status !== "ready") throw new Error("WeChat QR configuration unavailable");
      return mountWechatLogin(result.config, () => {
        if (active) setConfirming(true);
      });
    }).then(() => {
      if (!active) return;
      setStatus("ready");
    }).catch(() => {
      if (active) setStatus("error");
    });
    return () => {
      active = false;
      document.getElementById(CONTAINER_ID)?.replaceChildren();
    };
  }, [locale, retryNonce, returnTo]);

  useEffect(() => {
    if (!confirming) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissConfirmation();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirming, dismissConfirmation]);

  const query = new URLSearchParams({ locale, returnTo });
  const href = `/api/v1/auth/wechat/start?${query.toString()}`;
  return <aside className="auth-qr-column" aria-labelledby="wechat-access-title">
    <p className="auth-column-label">{words(locale, "快捷访问", "Quick access")}</p>
    <h2 id="wechat-access-title">{words(locale, "微信扫码登录或注册", "Sign in or register with WeChat")}</h2>
    {confirming ? <div className="wechat-confirmation-backdrop" aria-hidden="true" /> : null}
    <div
      className={`wechat-qr-frame is-${status}${confirming ? " is-confirming" : ""}`}
      aria-busy={status === "loading"}
      aria-label={confirming ? words(locale, "微信登录确认", "WeChat sign-in confirmation") : words(locale, "微信登录二维码区域", "WeChat sign-in QR area")}
      role={confirming ? "dialog" : undefined}
      aria-modal={confirming ? true : undefined}
    >
      <div id={CONTAINER_ID} className="wechat-login-container" />
      {confirming ? <button
        ref={closeButtonRef}
        className="wechat-confirmation-close"
        type="button"
        aria-label={words(locale, "关闭微信确认窗口", "Close WeChat confirmation")}
        onClick={dismissConfirmation}
      >×</button> : null}
      {status === "loading" ? <p className="wechat-qr-status">{words(locale, "正在加载微信二维码…", "Loading WeChat QR code…")}</p> : null}
      {status === "error" ? <div className="wechat-qr-error" role="alert">
        <p>{words(locale, "二维码加载失败，请重试或使用下方按钮继续。", "The QR code could not load. Retry or use the button below.")}</p>
        <button type="button" onClick={() => {
          setStatus("loading");
          setRetryNonce(value => value + 1);
        }}>{words(locale, "重试二维码", "Retry QR code")}</button>
      </div> : null}
    </div>
    <div className="wechat-qr-brand" aria-label={words(locale, "微信官方登录", "Official WeChat sign-in")}>
      <WechatIcon />
      <span>{words(locale, "微信官方登录", "Official WeChat sign-in")}</span>
    </div>
    <div className="wechat-login-copy">
      <strong>{words(locale, "扫码即可登录", "Scan to sign in")}</strong>
      <p className="wechat-login-note">{words(locale, "首次使用将自动创建账户，无需邮箱或密码。", "Your first scan creates an account. No email or password needed.")}</p>
      <a className="wechat-login-fallback" href={href}>
        {words(locale, "二维码无法识别？在微信中打开", "QR code not working? Open in WeChat")}
        <span aria-hidden="true">↗</span>
      </a>
      <p className="wechat-legal-consent">
        {words(locale, "扫码即表示您同意", "By scanning, you agree to the")} <Link href={`/${locale}/terms`}>{words(locale, "用户协议", "User Agreement")}</Link>
        {words(locale, " 和 ", " and ")}<Link href={`/${locale}/privacy`}>{words(locale, "隐私政策", "Privacy Policy")}</Link>
        {words(locale, "。", ".")}
      </p>
    </div>
  </aside>;
}

function WechatIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9.7 4.3c-4.2 0-7.5 2.6-7.5 5.9 0 1.9 1.1 3.6 2.9 4.7l-.7 2.5 2.9-1.5c.8.2 1.6.3 2.4.3h.5a5.6 5.6 0 0 1-.3-1.8c0-3.4 3.2-6.1 7.2-6.1h.1c-.9-2.3-3.8-4-7.5-4Zm-2.5 4a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm5 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
    <path d="M21.8 14.4c0-2.8-2.8-5-6.2-5s-6.2 2.2-6.2 5 2.8 5 6.2 5c.7 0 1.4-.1 2.1-.3l2.4 1.3-.6-2.1c1.4-1 2.3-2.3 2.3-3.9Zm-8.2-1a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm4.1 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z" />
  </svg>;
}
