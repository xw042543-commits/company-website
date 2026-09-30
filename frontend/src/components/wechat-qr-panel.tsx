"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthProviders } from "@/lib/auth-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

const qrPattern = "111111101010111111110100001011010100000110111010101011101101110101010111011011101011101110110111010101011101101000010101010000011111111010101111111000000001110100000010110111110101110101101001000011001001001011110111101001111010110101000001001011011010111111101110111011001000100010001101101111111010101011111110100000101011101000011011101110100011101101110101010111011010000010011101000110111111101010101111111";

export function WechatQrPanel({ locale, mode }: { locale: Locale; mode: "login" | "register" }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    void getAuthProviders(browserApiBaseUrl()).then(result => {
      if (active) setAvailable(result.status === "ready" && result.wechat);
    });
    return () => { active = false; };
  }, []);

  const returnTo = `/${locale}/account`;
  const query = new URLSearchParams({ locale, returnTo, intent: mode });
  const href = `/api/v1/auth/wechat/start?${query.toString()}`;
  return <aside className="auth-qr-column" aria-labelledby="wechat-access-title">
    <p className="auth-column-label">{words(locale, "快捷访问", "Quick access")}</p>
    <h2 id="wechat-access-title">{words(locale, "微信扫码登录或注册", "Sign in or register with WeChat")}</h2>
    <div className={`wechat-qr-frame${available ? " is-available" : ""}`} aria-label={words(locale, "微信登录二维码区域", "WeChat sign-in QR area")}>
      <div className="wechat-qr-grid" aria-hidden="true">{qrPattern.split("").map((cell, index) => <i className={cell === "1" ? "filled" : ""} key={index} />)}</div>
      <span aria-hidden="true">微信</span>
    </div>
    <div className="wechat-login-copy">
      <strong>{available ? words(locale, "微信服务已启用", "WeChat access is available") : words(locale, "等待微信服务启用", "Waiting for WeChat service")}</strong>
      <p>{available ? words(locale, "打开微信授权页面并使用手机确认。", "Open WeChat authorization and confirm on your phone.") : words(locale, "后端完成微信开放平台配置后，此处会生成可扫描的登录二维码。", "A scannable code will appear after the backend WeChat Open Platform setup is enabled.")}</p>
      <Link className="wechat-privacy-link" href={`/${locale}/privacy`}>{words(locale, "查看微信登录隐私说明", "Read the WeChat privacy notice")}</Link>
      {available ? <a className="wechat-login-button" href={href}>{words(locale, "打开微信登录", "Continue with WeChat")}</a> : <span className="wechat-login-disabled">{words(locale, "微信登录暂未启用", "WeChat sign-in is not enabled yet")}</span>}
    </div>
  </aside>;
}
