import type { Locale } from "./site.ts";

type AuthState = {
  status: "ready" | "accepted" | "validation-error" | "unauthorized" | "rate-limited" | "unavailable" | "error";
  fieldErrors?: Record<string, string>;
};

export type AuthMessage = { tone: "success" | "error"; text: string };

export function authMessage(locale: Locale, state: AuthState): AuthMessage {
  const chinese = locale === "zh";
  switch (state.status) {
    case "ready":
      return { tone: "success", text: chinese ? "操作已完成。" : "Completed successfully." };
    case "accepted":
      return { tone: "success", text: chinese ? "请求已提交，请按页面提示继续。" : "Request submitted. Follow the next step shown on this page." };
    case "validation-error":
      return { tone: "error", text: chinese ? "请检查填写的信息后重试。" : "Please check the information you entered and try again." };
    case "unauthorized":
      return { tone: "error", text: chinese ? "账号或密码不正确，请重新输入。" : "The account or password is incorrect. Please try again." };
    case "rate-limited":
      return { tone: "error", text: chinese ? "尝试次数过多，请稍后再试。" : "Too many attempts. Please try again later." };
    case "unavailable":
      return { tone: "error", text: chinese ? "账户服务暂时不可用，请稍后重试。" : "Account service is temporarily unavailable. Please try again later." };
    default:
      return { tone: "error", text: chinese ? "操作未完成，请稍后重试。" : "We could not complete the request. Please try again later." };
  }
}

export function registrationDestination(locale: Locale, method: "EMAIL" | "PHONE"): string {
  return `/${locale}/${method === "EMAIL" ? "verify-email" : "verify-phone"}`;
}
