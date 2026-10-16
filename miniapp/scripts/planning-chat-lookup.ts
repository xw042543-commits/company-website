type Source = { url: string | null; type: string | null; reference: string | null; checkedAt: string | null };
type Item = { programmeId: number; level: string; nameZh: string | null; nameEn: string | null; university: string;
  admissionsZh: string | null; admissionsEn: string | null; admissionsStatus: string;
  admissionsSource: Source; catalogueSource: Source; usableForAssessment: false };
const levels: Record<string,string> = {预科:'FOUNDATION',本科:'BACHELOR',硕士:'MASTER',博士:'DOCTOR'};
function source(value: Source) {
  let url = '';
  try { const parsed = new URL(value.url ?? ''); if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) url = parsed.href; } catch { /* Missing/unsafe source remains unavailable. */ }
  return [url || '暂无可用来源链接', value.reference, value.checkedAt ? `记录核查时间：${value.checkedAt}（不代表当前有效）` : '未记录核查时间'].filter(Boolean).join(' · ');
}
export async function lookupReply(text: string, request: typeof fetch = fetch): Promise<string> {
  if (text.length > 200) return '请把查询缩短到 200 字以内，只输入院校或专业关键词即可。';
  const found = [...new Set(text.match(/预科|本科|硕士|博士/g) ?? [])];
  if (found.length > 1) return '这次先查一个学历，或不写学历查询全部层次。';
  const keyword = text.replace(/预科|本科|硕士|博士/g,' ').trim();
  const params = new URLSearchParams({keyword});
  if (found[0]) params.set('level',levels[found[0]]!);
  params.set('page','0');
  let response: Response;
  try {
    response = await request(`/api/v1/admin/planning/programme-lookup?${params}`, {credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});
  } catch { throw new Error('查询暂时不可用，请检查本地网站和后端连接后重试。'); }
  if (response.status === 401) throw new Error('请先在同一网站登录管理员账号，再回来重试。');
  if (response.status === 403) throw new Error('当前账号没有管理员查询权限。');
  if (!response.ok) throw new Error('查询暂时不可用，请稍后重试。');
  const data = await response.json().catch(()=>null);
  if (!data || !Array.isArray(data.items) || data.items.length > 20 || typeof data.hasNext !== 'boolean'
      || !data.items.every((item: Item) => item && Number.isSafeInteger(item.programmeId) && typeof item.university === 'string'
        && (typeof item.nameZh === 'string' || typeof item.nameEn === 'string') && item.usableForAssessment === false
        && item.catalogueSource && item.admissionsSource)) throw new Error('查询结果格式异常，请重试。');
  if (!data.items.length) return `未找到与“${text}”匹配的已发布马来西亚专业。可尝试更短的院校或专业关键词；这不代表该专业不存在。`;
  const items: Item[] = data.items;
  return `查到以下已发布目录资料，均待核实，不是录取评估或完整费用方案。\n本次关键词：${keyword || '全部'} · ${found[0] || '全部学历'}\n\n`
    + items.map((item,index) => `${index+1}. ${item.nameZh || item.nameEn}\n${item.university} · ${Object.keys(levels).find(label => levels[label] === item.level) || '学历未标明'}\n资料待核实 · ${source(item.catalogueSource)}\n招生资料：${item.admissionsStatus === 'AI_GENERATED_UNVERIFIED' ? 'AI 生成，未经核验；' : ''}${item.admissionsZh || item.admissionsEn || '暂无资料'}\n招生来源：${source(item.admissionsSource)}`).join('\n\n')
    + (data.hasNext ? '\n\n还有更多结果，请增加院校或专业关键词缩小范围。' : '')
    + '\n\n当前为关键词查询，尚未接入 AI 模型；不判断录取机会或预算是否足够。';
}
