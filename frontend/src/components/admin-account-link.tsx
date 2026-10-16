"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminRead } from "@/lib/admin-catalog-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import type { Locale } from "@/lib/site";
import { watchProfileUpdates } from "@/lib/profile-sync";

export function AdminAccountLink({ locale }: { locale: Locale }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    let pending = false;
    const refresh = () => {
      if (pending) return;
      pending = true;
      void adminRead<{ permanentDelete: boolean }>(browserApiBaseUrl(), "/api/v1/admin/catalog/lifecycle/capabilities").then(r => {
        if (active) setAllowed(r.status === "ready" && r.value.permanentDelete === true);
      }).finally(() => { pending = false; });
    };
    refresh();
    const stop = watchProfileUpdates(refresh);
    return () => { active = false; stop(); };
  }, []);
  return allowed ? <Link className="button secondary" href={`/${locale}/admin/accounts`}>账号管理</Link> : null;
}
