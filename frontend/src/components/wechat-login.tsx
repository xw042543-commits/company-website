"use client";

import { useState } from "react";
import { authEndpoints, type WeChatQrStatus } from "@/lib/login-auth";
import { startDemoSession } from "@/app/actions/demo-session";
import { type Locale, words } from "@/lib/site";

export function WeChatLogin({
  locale,
  wechatQrUrl,
  wechatStatus = "waiting",
  returnTo,
}: {
  locale: Locale;
  wechatQrUrl?: string;
  wechatStatus?: WeChatQrStatus;
  returnTo?: string;
}) {
  const [refreshRequested, setRefreshRequested] = useState(false);
  const statusText: Record<WeChatQrStatus, string> = {
    waiting: words(locale, "等待扫码", "Waiting to scan"),
    scanned: words(locale, "已扫码，请在微信中确认", "Scanned, confirm in WeChat"),
    expired: words(locale, "二维码已过期", "QR code expired"),
    error: words(locale, "二维码暂时无法加载", "QR code could not load"),
  };

  return <div className="wechat-login-panel" data-status={wechatStatus} data-endpoint={authEndpoints.wechatQr} data-status-endpoint={authEndpoints.wechatStatus}>
    <div
      className={`wechat-qr-frame${wechatQrUrl ? " has-code" : ""}`}
      role="img"
      aria-label={words(locale, "微信登录二维码", "WeChat login QR code")}
      style={wechatQrUrl ? { backgroundImage: `url(${wechatQrUrl})` } : undefined}
    >
      {!wechatQrUrl && <div className="wechat-qr-placeholder" aria-hidden="true"><span>微信</span></div>}
    </div>
    <div className="wechat-login-copy">
      <span className="wechat-status-dot" aria-hidden="true" />
      <strong>{statusText[wechatStatus]}</strong>
      <p>{words(locale, "使用微信扫一扫，并在手机上确认登录。", "Scan with WeChat and confirm on your phone.")}</p>
      <button className="secondary" type="button" onClick={() => setRefreshRequested(true)}>{words(locale, "刷新二维码", "Refresh QR")}</button>
      <button type="button" onClick={() => startDemoSession(locale, returnTo)}>{words(locale, "进入会员演示", "Open member demo")}</button>
      {refreshRequested && <p className="wechat-refresh-status" role="status">{words(locale, "刷新请求已准备好，等待后端接入。", "Refresh request ready for backend integration.")}</p>}
    </div>
  </div>;
}
