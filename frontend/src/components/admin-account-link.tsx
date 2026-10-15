"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminRead } from "@/lib/admin-catalog-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import type { Locale } from "@/lib/site";

export function AdminAccountLink({ locale }: { locale: Locale }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    void adminRead<{ permanentDelete: boolean }>(browserApiBaseUrl(), "/api/v1/admin/catalog/lifecycle/capabilities").then(r => {
      if (active) setAllowed(r.status === "ready" && r.value.permanentDelete === true);
    });
    return () => { active = false; };
  }, []);
  return allowed ? <Link className="button secondary" href={`/${locale}/admin/accounts`}>账号管理</Link> : null;
}
