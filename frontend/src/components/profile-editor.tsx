"use client";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { type AdminApiResult } from "@/lib/admin-catalog-api";

import { avatarBase64, compressAvatar, readAvatarFile, squareCrop } from "@/lib/avatar-image";

import { AccountAvatar } from "./account-avatar";
import styles from "./admin-account-panel.module.css";

export type EditableProfile = { id: number; fullName: string; email: string | null; avatarUrl?: string | null; updatedAt?: string };
export type ProfileChanges = { fullName: string; avatarAction: string; expectedUpdatedAt?: string; contentType?: string; contentBase64?: string };
export function ProfileEditor<T extends EditableProfile>({ account, onCancel, onSaved, saveProfile, title = "编辑资料", statusLabel }: {
  account: T; onCancel: () => void; onSaved: (account: T) => void;
  saveProfile: (body: ProfileChanges) => Promise<AdminApiResult<T>>; title?: string; statusLabel?: string;
}) {
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
    if (!name.trim() || name.trim().length > 100 || /[\p{Cc}\p{Cf}]/u.test(name)) { setNotice("用户名须为1至100个字符，不能包含控制字符"); return; }
    setBusy(true); setNotice("");
    try {
      let contentBase64: string | undefined;
      if (action === "REPLACE") {
        if (!canvas.current) throw new Error("请重新选择头像");
        const blob = await compressAvatar(quality => new Promise(resolve => canvas.current!.toBlob(resolve, "image/jpeg", quality)));
        contentBase64 = await avatarBase64(blob);
      }
      const result = await saveProfile({
        fullName: name.trim(), avatarAction: action, expectedUpdatedAt: account.updatedAt,
        ...(contentBase64 ? { contentType: "image/jpeg", contentBase64 } : {}),
      });
      if (result.status === "ready") onSaved(result.value);
      else if (result.status === "unavailable") setNotice("网络连接中断，保存结果尚未确认，请刷新个人资料核对后再试");
      else setNotice(result.message && /[\u4e00-\u9fff]/.test(result.message) ? result.message : result.status === "forbidden" ? "无权修改此账号资料" : result.status === "unauthorized" ? "登录已失效，请重新登录" : "保存未完成，请刷新账号资料后重试");
    } catch (error) { setNotice(error instanceof Error ? error.message : "保存失败，原头像已保留"); }
    finally { setBusy(false); }
  }
  return createPortal(<div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="account-edit-title"><form ref={dialog} className={`admin-editor ${styles.editor}`} onSubmit={save} aria-busy={busy}>
    <header className={styles.editorHeader}><div><span className={styles.eyebrow}>个人资料</span><h2 id="account-edit-title">{title}</h2></div><button className={`secondary ${styles.closeButton}`} type="button" disabled={busy} onClick={onCancel} aria-label="关闭资料编辑">关闭</button></header>
    <div className={styles.editBody}>
      <div className={`${styles.accountMeta} ${statusLabel ? "" : styles.accountMetaCompact}`} aria-label="账户信息"><div><span>账号编号</span><strong>{account.id}</strong></div>{statusLabel && <div><span>状态</span><strong>{statusLabel}</strong></div>}<div><span>登录邮箱</span><strong>{account.email || "未绑定邮箱"}</strong><small>仅展示</small></div></div>
      <div className={styles.profileGrid}>
        <section className={styles.identitySection} aria-labelledby="profile-name-title">
          <div className={styles.sectionHeading}><span>01</span><div><h3 id="profile-name-title">公开身份</h3><p>此名称会显示在评论和公开内容中。</p></div></div>
          <label className={styles.nameField}>用户名<div className={styles.inputWrap}><input name="fullName" required maxLength={100} value={name} disabled={busy} onChange={e => setName(e.target.value)} /><span>{Array.from(name).length}/100</span></div></label>
          <p className={styles.safetyNote}>请使用常用称呼，避免填写证件号码、联系方式等敏感信息。</p>
        </section>
        <section className={styles.avatarSection} aria-labelledby="profile-avatar-title">
          <div className={styles.sectionHeading}><span>02</span><div><h3 id="profile-avatar-title">头像</h3><p>上传后可调整裁剪位置。</p></div></div>
          <div className={styles.avatarWorkspace}>
            <div className={styles.avatarPreview}>
              {picture && action === "REPLACE" ? <canvas ref={canvas} width={512} height={512} className={styles.cropPreview} aria-label="头像裁剪预览" />
                : <AccountAvatar name={name} url={action === "REMOVE" ? null : account.avatarUrl} size={112} />}
            </div>
            <div className={styles.avatarControls}>
              <label className={styles.fileField}><span>{reading ? "正在读取…" : picture ? "重新选择图片" : "选择头像图片"}</span><input className={styles.fileInput} aria-label="上传头像" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" disabled={busy || reading} onChange={e => { void choose(e.target.files?.[0]); e.target.value = ""; }} /></label>
              <p className={styles.fileHint}>JPG、PNG 或 WebP，原图不超过 1MB。保存时自动压缩。</p>
              <div className={styles.avatarActions}><button className={styles.textAction} type="button" disabled={busy || reading} onClick={() => { setAction("REMOVE"); setPicture(null); }}>删除头像</button><button className={styles.textAction} type="button" disabled={busy || reading} onClick={() => { setAction("KEEP"); setPicture(null); setNotice(""); }}>恢复原头像</button></div>
              {action === "REMOVE" && <p className={styles.pendingNote} role="status">保存后将移除当前头像。</p>}
            </div>
          </div>
          {picture && action === "REPLACE" && <div className={styles.cropControls}>
            <label className={styles.range}>缩放<input type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy} onChange={e => setZoom(Number(e.target.value))} /></label>
            <div className={styles.positionControls}><label className={styles.range}>水平位置<input type="range" min="0" max="1" step="0.01" value={x} disabled={busy} onChange={e => setX(Number(e.target.value))} /></label><label className={styles.range}>垂直位置<input type="range" min="0" max="1" step="0.01" value={y} disabled={busy} onChange={e => setY(Number(e.target.value))} /></label></div>
          </div>}
          {reading && <p className={styles.pendingNote} role="status">正在读取图片…</p>}
        </section>
      </div>
    </div><footer className={styles.editorFooter}>{notice && <p className="admin-notice" role="alert">{notice}</p>}<button className="secondary" type="button" disabled={busy} onClick={onCancel}>取消</button><button disabled={busy || reading || !name.trim()}>{busy ? "正在保存…" : "保存修改"}</button></footer>
  </form></div>, document.body);
}
