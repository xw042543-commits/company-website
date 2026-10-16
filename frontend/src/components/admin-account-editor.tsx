"use client";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { adminWrite } from "@/lib/admin-catalog-api";
import { accountStatuses, type ManagedAccount } from "@/lib/admin-account-api";
import { avatarBase64, compressAvatar, readAvatarFile, squareCrop } from "@/lib/avatar-image";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { AccountAvatar } from "./account-avatar";
import styles from "./admin-account-panel.module.css";

export function AdminAccountEditor({ account, onCancel, onSaved }: { account: ManagedAccount; onCancel: () => void; onSaved: (account: ManagedAccount) => void }) {
  const [name, setName] = useState(account.fullName), [action, setAction] = useState("KEEP"), [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false), [reading, setReading] = useState(false);
  const [picture, setPicture] = useState<Awaited<ReturnType<typeof readAvatarFile>> | null>(null);
  const [zoom, setZoom] = useState(1), [x, setX] = useState(.5), [y, setY] = useState(.5);
  const canvas = useRef<HTMLCanvasElement>(null), dialog = useRef<HTMLFormElement>(null), version = useRef(0);
  useEffect(() => () => { version.current++; }, []);
  useEffect(() => () => { picture?.dispose(); }, [picture]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null, overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLInputElement>('input[name="fullName"]')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
      if (event.key !== "Tab") return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>("input:not(:disabled),button:not(:disabled)");
      if (!elements?.length) { event.preventDefault(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", key); previous?.focus(); };
  }, [busy, onCancel]);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context || !picture) return;
    const crop = squareCrop(picture.image.naturalWidth, picture.image.naturalHeight, zoom, x, y);
    context.fillStyle = "#fff"; context.fillRect(0, 0, 512, 512);
    context.drawImage(picture.image, crop.x, crop.y, crop.side, crop.side, 0, 0, 512, 512);
  }, [picture, zoom, x, y]);
  async function choose(file?: File) {
    if (!file) return;
    const current = ++version.current; setReading(true); setNotice("");
    try {
      const result = await readAvatarFile(file);
      if (current !== version.current) { result.dispose(); return; }
      setPicture(result); setAction("REPLACE"); setZoom(1); setX(.5); setY(.5);
    } catch (error) { if (current === version.current) setNotice(error instanceof Error ? error.message : "图片读取失败"); }
    finally { if (current === version.current) setReading(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy || reading) return;
    setBusy(true); setNotice("");
    try {
      let contentBase64: string | undefined;
      if (action === "REPLACE") {
        if (!canvas.current) throw new Error("请重新选择头像");
        const blob = await compressAvatar(quality => new Promise(resolve => canvas.current!.toBlob(resolve, "image/jpeg", quality)));
        contentBase64 = await avatarBase64(blob);
      }
      const result = await adminWrite<ManagedAccount>(browserApiBaseUrl(), `/api/v1/admin/accounts/${account.id}/profile`, "PATCH", {
        fullName: name.trim(), avatarAction: action, expectedUpdatedAt: account.updatedAt,
        ...(contentBase64 ? { contentType: "image/jpeg", contentBase64 } : {}),
      });
      if (result.status === "ready") onSaved(result.value);
      else setNotice(result.message && /[\u4e00-\u9fff]/.test(result.message) ? result.message : result.status === "forbidden" ? "仅高级管理员可编辑其他账号" : result.status === "unauthorized" ? "登录已失效，请重新登录" : "保存失败，原资料已保留，请重试");
    } catch (error) { setNotice(error instanceof Error ? error.message : "保存失败，原头像已保留"); }
    finally { setBusy(false); }
  }
  return createPortal(<div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="account-edit-title"><form ref={dialog} className={`admin-editor ${styles.editor}`} onSubmit={save} aria-busy={busy}>
    <header><h2 id="account-edit-title">编辑账号</h2><button className="secondary" type="button" disabled={busy} onClick={onCancel}>关闭</button></header>
    <div className={styles.editBody}>
      <p>账号编号：{account.id}　状态：{accountStatuses[account.status]}</p><p>邮箱：{account.email || "未绑定邮箱"}（仅展示）</p>
      <label className={styles.nameField}>用户名<input name="fullName" required maxLength={100} value={name} disabled={busy} onChange={e => setName(e.target.value)} /></label>
      <h3>头像</h3>
      {picture && action === "REPLACE" ? <><canvas ref={canvas} width={512} height={512} className={styles.cropPreview} aria-label="头像裁剪预览" />
        <label className={styles.range}>缩放<input type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy} onChange={e => setZoom(Number(e.target.value))} /></label>
        <label className={styles.range}>水平位置<input type="range" min="0" max="1" step="0.01" value={x} disabled={busy} onChange={e => setX(Number(e.target.value))} /></label>
        <label className={styles.range}>垂直位置<input type="range" min="0" max="1" step="0.01" value={y} disabled={busy} onChange={e => setY(Number(e.target.value))} /></label>
      </> : <AccountAvatar name={name} url={action === "REMOVE" ? null : account.avatarUrl} size={96} />}
      <label className={styles.fileField}>上传或更换头像<input aria-label="上传头像" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" disabled={busy || reading} onChange={e => { void choose(e.target.files?.[0]); e.target.value = ""; }} /></label>
      <p>支持JPG、PNG、WebP，原图不超过1MB。通过滑块裁剪为正方形，保存时自动压缩。</p>
      <div className={styles.actions}><button className="secondary" type="button" disabled={busy || reading} onClick={() => { setAction("REMOVE"); setPicture(null); }}>删除头像</button><button className="secondary" type="button" disabled={busy || reading} onClick={() => { setAction("KEEP"); setPicture(null); setNotice(""); }}>恢复原头像</button></div>
      {reading && <p role="status">正在读取图片…</p>}{notice && <p className="admin-notice" role="alert">{notice}</p>}
    </div><footer><button className="secondary" type="button" disabled={busy} onClick={onCancel}>取消</button><button disabled={busy || reading || !name.trim()}>{busy ? "正在保存…" : "保存修改"}</button></footer>
  </form></div>, document.body);
}
