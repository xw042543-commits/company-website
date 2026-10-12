"use client";

import { useEffect, useState } from "react";
import { getAuthProviders } from "@/lib/auth-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

export function WechatLoginEntry({ locale, returnTo }: { locale: Locale; returnTo: string }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    void getAuthProviders(browserApiBaseUrl()).then((result) => {
      if (active) setAvailable(result.status === "ready" && result.wechat);
    });
    return () => { active = false; };
  }, []);

  if (!available) return null;
  const query = new URLSearchParams({ locale, returnTo });
  return <div className="wechat-login-entry">
    <span>{words(locale, "或", "or")}</span>
    <a className="wechat-login-button" href={`/api/v1/auth/wechat/start?${query.toString()}`}>
      {words(locale, "微信扫码登录", "Sign in with WeChat")}
    </a>
  </div>;
}
