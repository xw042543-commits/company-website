import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const officialDomains = {
  apu: ['apu.edu.my'], sunway: ['sunwayuniversity.edu.my', 'sunway.edu.my'],
  taylor: ['taylors.edu.my'], monash: ['monash.edu.my', 'monash.edu'], um: ['um.edu.my'],
  ukm: ['ukm.my'], segi: ['segi.edu.my'], southampton: ['southampton.ac.uk', 'southamptonmalaysia.edu.my'],
  ucsi: ['ucsiuniversity.edu.my'], utar: ['utar.edu.my'], nilai: ['nilai.edu.my'], mahsa: ['mahsa.edu.my'],
  help: ['help.edu.my'], inti: ['newinti.edu.my'], nottingham: ['nottingham.edu.my'], uum: ['uum.edu.my'],
  upm: ['upm.edu.my'], city: ['city.edu.my'], utm: ['utm.my'], usm: ['usm.my'],
};
const levels = new Set(['FOUNDATION', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTOR']);
export function canonicalProgrammeName(name) {
  return String(name ?? '').normalize('NFKC').toLowerCase().replace(/&/g, ' and ')
    .replace(/^msc\b/, 'master of science').replace(/^ma\b/, 'master of arts')
    .replace(/^phd\b/, 'doctor of philosophy').replace(/^mphil\b/, 'master of philosophy')
    .replace(/\bbachelor in\b/g, 'bachelor of')
    .replace(/\b(?:hons|honours|honors)\b/g, '').replace(/[^a-z0-9]/g, '');
}
function normalizedEvidence(row) {
  const evidence = row.evidence ?? {};
  return {
    title: row.evidenceTitle ?? evidence.documentTitle ?? evidence.title ?? null,
    text: row.evidenceRaw ?? evidence.rawText ?? evidence.text ?? null,
    method: evidence.origin ?? row.evidenceMethod ?? 'official_document',
  };
}
export function programmeSubject(name) {
  return String(name ?? '').toLowerCase()
    .replace(/\s*[-–—]+\s*(?:school|centre|center|institute|faculty|advanced medical).*$/i, '')
    .replace(/\((?:coursework|research|mixed mode|online|by research)\)/gi, ' ')
    .replace(/\bfield of research\s*:|\bspeciali[sz]ations?\s*:/g, ' ')
    .replace(/^(?:bachelor|master|doctor)(?:s)?\s+(?:of|in)?\s*(?:arts|science|social sciences|engineering|philosophy)?\s*/i, '')
    .replace(/^(?:msc|ma|mphil|phd)\b/i, '')
    .replace(/accountancy/g, 'accounting').replace(/counselling/g, 'counseling')
    .replace(/biothecnology/g, 'biotechnology').replace(/architechture/g, 'architecture')
    .replace(/physiotheraphy/g, 'physiotherapy').replace(/enterprenuership/g, 'entrepreneurship')
    .replace(/\bstatistic\b/g, 'statistics').replace(/\blinguistic\b/g, 'linguistics')
    .replace(/\bstudy\b/g, 'studies').replace(/\bnetworks\b/g, 'network')
    .replace(/\b(?:of|in|with|for|as|a|the|honours|honors|hons|tesl|mbbs)\b/g, '')
    .replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}
export function normalizeAuditRecord(row, current) {
  const evidence = normalizedEvidence(row);
  const outcome = row.verificationStatus ?? row.verificationOutcome ?? row.pendingOutcome ?? row.attemptResult;
  return {
    universitySlug: current.universitySlug, programmeCode: current.programmeCode,
    current: { nameZh: current.nameZh, nameEn: current.nameEn, studyLevelCode: current.studyLevelCode,
      categoryCode: current.categoryCode, courseModeCode: current.courseModeCode },
    verified: row.verified === true,
    outcome: row.verified ? 'verified' : typeof outcome === 'string' ? outcome.toLowerCase() : 'needs_review',
    nameZh: row.accurateNameZh ?? row.nameZh ?? current.nameZh,
    nameEn: row.officialNameEn ?? row.nameEn ?? current.nameEn,
    studyLevelCode: row.level ?? row.studyLevelCode ?? current.studyLevelCode,
    categoryCode: row.category ?? row.categoryCode ?? current.categoryCode,
    sourceType: row.verified ? 'official' : null,
    sourceUrl: row.sourceUrl,
    sourceCheckedAt: row.fetchedAt ?? row.sourceCheckedAt ?? row.attemptedAt ?? null,
    evidence, reason: row.reason ?? row.unverifiedReason ?? row.failureReason ?? null,
  };
}
export function validateAuditRecord(row) {
  const errors = [];
  let source;
  try { source = new URL(row.sourceUrl); } catch { errors.push('来源网址无效'); }
  if (source && (source.protocol !== 'https:' || !officialDomains[row.universitySlug]?.some(
    domain => source.hostname === domain || source.hostname.endsWith('.' + domain)))) {
    errors.push('来源不是该校允许的官方 HTTPS 域名');
  }
  if (!row.verified) {
    if (!row.reason) errors.push('未确认记录缺少原因');
    return errors;
  }
  if (row.universitySlug === 'ukm' && row.current?.nameEn
    && programmeSubject(row.current.nameEn) !== programmeSubject(row.nameEn)) {
    errors.push('原专业主体与官网专业主体不一致，不能用整名相似度强行关联');
  }
  if (!/[\u3400-\u9fff]/u.test(row.nameZh ?? '')) errors.push('缺少简体中文名称');
  if (!/[a-z]/i.test(row.nameEn ?? '')) errors.push('缺少官网英文名称');
  if (/(?:cgpa|ielts|toefl|entry requirements?|tuition|all faculty)/i.test(row.nameEn ?? '')) {
    errors.push('专业名称混入成绩、入学要求、费用或院系标题');
  }
  if (!levels.has(row.studyLevelCode)) errors.push('学历层次不在现有字典内');
  if (!/^[A-Z][A-Z0-9_]*$/.test(row.categoryCode ?? '')) errors.push('学科分类代码无效');
  if (!row.evidence.title || !row.evidence.text) errors.push('缺少具体项目官网原文证据');
  if (!Number.isFinite(Date.parse(row.sourceCheckedAt))) errors.push('缺少有效核对时间');
  if (/^Bachelor\b/i.test(row.nameEn) && row.studyLevelCode !== 'BACHELOR') errors.push('学士名称与学历层次冲突');
  if (/^(?:Master\b|MSc\b|MPhil\b|MA\b|MBA\b)/i.test(row.nameEn) && row.studyLevelCode !== 'MASTER') errors.push('硕士名称与学历层次冲突');
  if (/^(?:Doctor of Philosophy|PhD\b|Engineering Doctorate|Doctor of Engineering|Doctor of Business Administration|Doctor of Education|Doctor of Public Health|DrPH\b)/i.test(row.nameEn)
    && row.studyLevelCode !== 'DOCTOR') errors.push('博士名称与学历层次冲突');
  if (/^(?:postgraduate (?:diploma|certificate)|PGDip|PGCert)\b/i.test(row.nameEn)
    && row.studyLevelCode === 'MASTER') errors.push('研究生文凭或证书不能标记为硕士学位');
  if (row.nameZh?.length > 200 || row.nameEn?.length > 200) errors.push('名称超出数据库字段长度');
  return errors;
}
export function buildAudit(snapshot, bundles) {
  const current = new Map(snapshot.universities.flatMap(university => university.records.map(record => [
    record.programmeCode, { ...record, universitySlug: university.slug },
  ])));
  const seen = new Set();
  const records = [];
  for (const bundle of bundles) for (const input of bundle.records) {
    const previous = current.get(input.programmeCode);
    if (!previous || input.universitySlug !== previous.universitySlug) throw new Error(`院校或专业编号不匹配：${input.programmeCode}`);
    if (seen.has(input.programmeCode)) throw new Error(`专业编号重复审核：${input.programmeCode}`);
    seen.add(input.programmeCode);
    const row = normalizeAuditRecord(input, previous);
    const errors = validateAuditRecord(row);
    if (errors.length) {
      row.verified = false;
      row.sourceType = null;
      row.outcome = 'validation_failed';
      row.reason = errors.join('；');
    }
    records.push(row);
  }
  if (seen.size !== current.size) throw new Error(`审核未覆盖全量：${seen.size}/${current.size}`);
  const groups = new Map();
  for (const row of records.filter(row => row.verified)) {
    const key = [row.universitySlug, row.studyLevelCode, row.categoryCode, row.current.courseModeCode ?? '', canonicalProgrammeName(row.nameEn)].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => Number(Boolean(b.current.nameEn)) - Number(Boolean(a.current.nameEn))
      || a.programmeCode.localeCompare(b.programmeCode));
    const survivor = group[0];
    for (const duplicate of group.slice(1)) {
      duplicate.verified = false;
      duplicate.outcome = 'duplicate_pending_review';
      duplicate.duplicateOf = survivor.programmeCode;
      duplicate.reason = `与 ${survivor.programmeCode} 的官网名称、学历、学科分类及现有授课模式一致；校区/模式差异尚无唯一证据，暂隐藏待审核，保留记录与关联。`;
    }
  }
  const verified = records.filter(row => row.verified);
  const summary = {
    total: records.length, verified: verified.length,
    needsReview: records.length - verified.length,
    changed: verified.filter(row => row.nameZh !== row.current.nameZh || row.nameEn !== row.current.nameEn
      || row.studyLevelCode !== row.current.studyLevelCode || row.categoryCode !== row.current.categoryCode).length,
    duplicatePendingReview: records.filter(row => row.outcome === 'duplicate_pending_review').length,
    byUniversity: Object.fromEntries(snapshot.universities.map(university => [university.slug, {
      total: university.records.length,
      verified: verified.filter(row => row.universitySlug === university.slug).length,
      needsReview: records.filter(row => row.universitySlug === university.slug && !row.verified).length,
    }])),
  };
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), snapshotGeneratedAt: snapshot.generatedAt, summary, records };
}
function csv(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
export async function writeAudit(audit, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, 'official-verification.json'), JSON.stringify(audit, null, 2) + '\n');
  const header = ['院校', '专业编号', '核对结果', '中文名称', '官方英文名称', '学历代码', '学科代码', '来源类型', '官网链接', '核对时间', '官网标题证据', '处理原因', '重复对应编号'];
  const rows = audit.records.map(row => [row.universitySlug, row.programmeCode, row.verified ? '官网确认' : '待审核', row.nameZh, row.nameEn,
    row.studyLevelCode, row.categoryCode, row.sourceType, row.sourceUrl, row.sourceCheckedAt, row.evidence.title, row.reason, row.duplicateOf]);
  await writeFile(path.join(outputDirectory, 'official-verification.csv'), '\uFEFF' + [header, ...rows].map(row => row.map(csv).join(',')).join('\n') + '\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [snapshotPath, outputDirectory, ...bundlePaths] = process.argv.slice(2);
  if (!snapshotPath || !outputDirectory || !bundlePaths.length) throw new Error('用法：node scripts/programme-taxonomy-audit.mjs <snapshot.json> <output> <audit-a.json> ...');
  const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
  const bundles = await Promise.all(bundlePaths.map(async file => JSON.parse(await readFile(file, 'utf8'))));
  const audit = buildAudit(snapshot, bundles);
  await writeAudit(audit, outputDirectory);
  console.log(JSON.stringify(audit.summary));
}
