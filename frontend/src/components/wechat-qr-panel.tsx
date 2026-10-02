"use client";

import { useEffect, useState } from "react";
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

function mountWechatLogin(config: WechatQrConfig): Promise<void> {
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
      iframe.addEventListener("load", () => finish(), { once: true });
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

export function WechatQrPanel({ locale, mode, returnTo: requestedReturnTo }: {
  locale: Locale;
  mode: "login" | "register";
  returnTo?: string;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [retryNonce, setRetryNonce] = useState(0);
  const returnTo = requestedReturnTo ?? `/${locale}/account`;
  useEffect(() => {
    let active = true;
    void Promise.all([
      getWechatQrConfig(browserApiBaseUrl(), locale, returnTo),
      loadWechatLoginScript(),
    ]).then(([result]) => {
      if (!active) return;
      if (result.status !== "ready") throw new Error("WeChat QR configuration unavailable");
      return mountWechatLogin(result.config);
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

  const query = new URLSearchParams({ locale, returnTo, intent: mode });
  const href = `/api/v1/auth/wechat/start?${query.toString()}`;
  return <aside className="auth-qr-column" aria-labelledby="wechat-access-title">
    <p className="auth-column-label">{words(locale, "快捷访问", "Quick access")}</p>
    <h2 id="wechat-access-title">{words(locale, "微信扫码登录或注册", "Sign in or register with WeChat")}</h2>
    <div className={`wechat-qr-frame is-${status}`} aria-busy={status === "loading"} aria-label={words(locale, "微信登录二维码区域", "WeChat sign-in QR area")}>
      <div id={CONTAINER_ID} className="wechat-login-container" />
      {status === "loading" ? <p className="wechat-qr-status">{words(locale, "正在加载微信二维码…", "Loading WeChat QR code…")}</p> : null}
      {status === "error" ? <div className="wechat-qr-error" role="alert">
        <p>{words(locale, "二维码加载失败，请重试或使用下方按钮继续。", "The QR code could not load. Retry or use the button below.")}</p>
        <button type="button" onClick={() => {
          setStatus("loading");
          setRetryNonce(value => value + 1);
        }}>{words(locale, "重试二维码", "Retry QR code")}</button>
      </div> : null}
    </div>
    <div className="wechat-login-copy">
      <strong>{words(locale, "使用微信扫码登录", "Scan to continue with WeChat")}</strong>
      <p>{words(locale, "打开微信扫一扫，在手机上确认登录或注册。", "Scan with WeChat and confirm sign-in or registration on your phone.")}</p>
      <Link className="wechat-privacy-link" href={`/${locale}/privacy`}>{words(locale, "查看微信登录隐私说明", "Read the WeChat privacy notice")}</Link>
      <a className="wechat-login-button" href={href}>{words(locale, "打开微信登录", "Continue with WeChat")}</a>
    </div>
  </aside>;
}
