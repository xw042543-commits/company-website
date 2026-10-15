import { getCsrfToken } from "./auth-api.ts";
import { adminRead, adminWrite, type AdminApiResult } from "./admin-catalog-api.ts";
export type ImportType = "UNIVERSITY" | "PROGRAMME";
export type ImportBatch = { id: string; entityType: ImportType; originalFilename: string; uploadedByUserId: number; uploadedByName: string; status: string; totalRows: number; draftRows: number; exactDuplicateRows: number; possibleDuplicateRows: number; conflictRows: number; invalidRows: number; publishedRows: number; failedRows: number; failureReason: string | null; createdAt: string; updatedAt: string; publishedAt: string | null };
export type ImportRow = { id: number; batchId: string; rowNumber: number; entityType: ImportType; classification: string; draftStatus: string; payload: Record<string, string>; duplicateReason: string | null; matchedRecordId: number | null; publishedRecordId: number | null; errorMessage: string | null; updatedAt: string };
export const ROOT = "/api/v1/admin/imports";
export { adminRead, adminWrite };
export async function uploadExcel(base: string | undefined, type: ImportType, file: File): Promise<AdminApiResult<{batch: ImportBatch}>> {
  const csrf = await getCsrfToken(base);
  if (csrf.status !== "ready") return { status: "unavailable", message: "登录状态已失效，请刷新页面后重试。" };
  const form = new FormData(); form.set("type", type); form.set("file", file);
  try {
    const response = await fetch(`${(base ?? "").replace(/\/$/, "")}${ROOT}`, { method: "POST", credentials: "include", cache: "no-store", signal: AbortSignal.timeout(60_000), headers: { [csrf.headerName]: csrf.token }, body: form });
    if (response.ok) return { status: "ready", value: await response.json() as {batch: ImportBatch} };
    const error = await response.json().catch(() => ({})) as {message?: string};
    return { status: response.status === 403 ? "forbidden" : response.status === 401 ? "unauthorized" : "error", message: error.message || "上传失败，请检查文件大小和格式。" };
  } catch { return {status: "unavailable", message: "上传超时或网络异常，请先查看导入记录，避免重复上传。"}; }
}
export async function downloadExcel(base: string | undefined, path: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(`${(base ?? "").replace(/\/$/, "")}${path}`, {credentials: "include", cache: "no-store", signal: AbortSignal.timeout(60_000)});
    if (!response.ok) return "下载失败，请确认管理员权限后重试。";
    const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); return null;
  } catch { return "下载失败，请检查网络后重试。"; }
}
export const universityFields = "universityCode:院校编码*,slug:网址标识*,nameZh:院校中文名称,nameEn:院校英文名称,countryCode:国家代码*,aliases:别名（分号分隔）,regionZh:地区中文,regionEn:地区英文,descriptionZh:简介中文,descriptionEn:简介英文,officialUrl:官网链接,logoUrl:Logo链接";
export const programmeFields = "programmeCode:专业编码*,universityCode:所属院校编码*,slug:网址标识*,nameZh:专业中文名称,nameEn:专业英文名称,aliases:别名（分号分隔）,categoryCode:学科分类代码*,studyLevelCode:学历层次代码*,campus:校区,courseModeCode:授课方式代码,durationMonths:学制月数,durationDisplay:学制说明,tuitionMin:最低学费,tuitionMax:最高学费,tuitionCurrency:币种代码,tuitionDisplay:学费说明,descriptionZh:专业介绍中文,descriptionEn:专业介绍英文,admissionsZh:入学要求中文,admissionsEn:入学要求英文,curriculumZh:课程介绍中文,curriculumEn:课程介绍英文,officialUrl:官网链接";
export function importFields(type: ImportType) { return (type === "UNIVERSITY" ? universityFields : programmeFields).split(",").map(field => {const [key, title] = field.split(":"); return {key, title};}); }
export function rowLabel(row: ImportRow) { if(row.draftStatus === "PUBLISHED") return "已发布"; if(row.draftStatus === "REMOVED") return "已移除"; return ({NEW: "有效草稿", EXACT_DUPLICATE: "完全重复", POSSIBLE_DUPLICATE: "疑似重复", CONFLICT: "字段冲突", INVALID: "校验错误"} as Record<string,string>)[row.classification] || "处理失败"; }
