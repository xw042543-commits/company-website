import { Locale, words } from "@/lib/site";

export function FormProgress({ completed, locale, total }: { completed: number; locale: Locale; total: number }) {
  const safeTotal = Math.max(1, total);
  const value = Math.min(safeTotal, Math.max(0, completed));
  const percent = Math.round((value / safeTotal) * 100);

  return <div className="form-progress" role="progressbar" aria-valuemin={0} aria-valuemax={safeTotal} aria-valuenow={value} aria-label={words(locale, "表格完成进度", "Form completion progress")}>
    <div className="form-progress-copy"><span>{words(locale, "填写进度", "Your progress")}</span><strong>{percent}%</strong></div>
    <div className="form-progress-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
  </div>;
}
