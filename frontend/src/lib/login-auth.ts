export type LoginMethod = "password" | "phone" | "wechat";
export type WeChatQrStatus = "waiting" | "scanned" | "expired" | "error";

export type PasswordLoginRequest = {
  account: string;
  password: string;
};

export type PhoneCodeRequest = {
  countryCode: "+60" | "+86";
  phoneNumber: string;
};

export type PhoneLoginRequest = PhoneCodeRequest & {
  verificationCode: string;
};

export type WeChatQrSession = {
  sessionId: string;
  qrImageUrl: string;
  expiresAt: string;
  status: WeChatQrStatus;
};

export const authEndpoints = {
  password: "/api/auth/login",
  requestPhoneCode: "/api/auth/phone/code",
  phone: "/api/auth/phone/login",
  wechatQr: "/api/auth/wechat/qr",
  wechatStatus: "/api/auth/wechat/status",
} as const;
