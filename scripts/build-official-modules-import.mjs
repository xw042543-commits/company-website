import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {COURSE_MODULE_FIELDS} from './course-module-fingerprint.mjs';
import {createHash} from 'node:crypto';
const domains={apu:['apu.edu.my'],sunway:['sunwayuniversity.edu.my'],taylor:['taylors.edu.my'],um:['um.edu.my'],ukm:['ukm.my'],utm:['utm.my'],upm:['upm.edu.my'],usm:['usm.my'],uum:['uum.edu.my'],inti:['newinti.edu.my'],ucsi:['ucsiuniversity.edu.my'],utar:['utar.edu.my'],nilai:['nilai.edu.my'],mahsa:['mahsa.edu.my'],help:['help.edu.my'],nottingham:['nottingham.edu.my'],monash:['monash.edu.my'],southampton:['southamptonmalaysia.edu.my','malaysia.southampton.ac.uk'],segi:['segi.edu.my'],city:['city.edu.my']};
export function validateModule(module,slug,{requireChinese=true}={}){
 const errors=[];let url;try{url=new URL(module.sourceUrl);}catch{errors.push('无效来源');}
 if(url && (url.protocol!=='https:' || !domains[slug]?.some(d=>url.hostname===d||url.hostname.endsWith('.'+d))))errors.push('不是对应大学官网');
 if(typeof module.nameEn!=='string'||!module.nameEn.trim()||/[\u3400-\u9fff]/u.test(module.nameEn)||module.nameEn.length>180)errors.push('课程原名无效');
 if(/\b(?:CGPA|GPA|IELTS|TOEFL|MUET|entry requirements?|minimum (?:score|grade|average)|tuition)\b|\d+\s*%|^(?:year|semester)\s*\d|^(?:choose|select|students?|note|recommended packages)\b/i.test(module.nameEn??''))errors.push('非课程内容');
 if(/^(?:(?:external )?faculty|department|discipline|university|univerity|programme|program|free|open)\s+electives?\b|^Elective\s+(?:Courses?|Modules?|Subjects?)(?:\b|_)|^Stream\s+\d+\b/i.test(module.nameEn??''))errors.push('选修占位类别不是课程标题');
 if(['Measurement of Advanced','Sinography and Chinese Ancient'].includes(module.nameEn))errors.push('原始标题不完整，待官方核实');
 if(/^(?:Kursus Elektif|Pilih\b|Sila\b|Elective (?:University )?Courses?\s*[:(])|\b(?:rujuk senarai|pilih \d|SHE[ _-]*Cluster|Technology\s*\/\s*Artificial Intelligence and Data Analytics)/i.test(module.nameEn??''))errors.push('选课说明或类别不是课程');
 if(requireChinese){
  if(typeof module.nameZh!=='string'||!/[\u3400-\u9fff]/u.test(module.nameZh)||/参考学习领域|暂无|待核实/.test(module.nameZh))errors.push('缺少已校验中文译名');
  if(!module.translationMethod||!Number.isFinite(Date.parse(module.translationCheckedAt)))errors.push('缺少翻译记录');
  if(module.descriptionEn&&!module.descriptionZh)errors.push('官方介绍缺少中文翻译');
 }
 if(!Number.isFinite(Date.parse(module.sourceCheckedAt)))errors.push('无抓取时间');
 if(typeof module.evidence!=='string'||!module.evidence.includes(module.nameEn))errors.push('课程名称未在原文证据中出现');
 for(const field of ['courseCode','credits','requirement','curriculumVersion'])if(module[field]!=null&&typeof module[field]!=='string')errors.push(field+'类型错误');
 if(module.courseCode && !module.evidence.includes(module.courseCode))errors.push('代码未在证据中出现');
 if(module.credits && !module.evidence.includes(module.credits))errors.push('学分未在证据中出现');
 return errors;
}
const quote=v=>v==null?'NULL':"'"+String(v).replaceAll("'","''")+"'";
export function buildImport(audit){
 const batch='official-modules-v64-'+createHash('sha256').update(JSON.stringify(audit.records)).digest('hex').slice(0,24);
 const moduleFrame=COURSE_MODULE_FIELDS.map(field=>`COALESCE(m->>'${field}',chr(29))`).join('||chr(31)||');
 const seen=new Set();for(const row of audit.records){if(seen.has(row.programmeCode))throw new Error('专业编号重复');seen.add(row.programmeCode);
 if(!/^[a-f0-9]{32}$/.test(row.expectedCourseFingerprint??''))throw new Error('缺少原课程快照指纹');
 if(!domains[row.universitySlug])throw new Error('仅允许马来西亚已核对院校');
 if(row.status==='VERIFIED'){
  if(!row.ownership||!row.ownership.studyLevelCode)throw new Error('缺少原始专业归属快照');
  if(!row.modules?.length)throw new Error('已确认专业缺少课程');
  const keys=new Set();for(const module of row.modules){const errors=validateModule(module,row.universitySlug);if(errors.length)throw new Error(row.programmeCode+':'+errors.join('；'));
  const key=(module.courseCode||'')+'|'+module.nameEn.toLowerCase();if(keys.has(key))throw new Error('重复课程');keys.add(key);}
 }else if(row.modules?.length)throw new Error('待核实记录不得携带公开课程');}
 const values=audit.records.map(r=>`(${[r.universitySlug,r.programmeCode,r.status==='VERIFIED',JSON.stringify(r.modules??[]),r.curriculumVersion??null,r.ownership?.programmeNameEn??null,r.ownership?.programmeNameZh??null,r.ownership?.studyLevelCode??null,r.expectedCourseFingerprint].map(quote).join(',')})`).join(',\n');
 return `-- V64: additive course-data correction. V53 schema and original migration remain unchanged.
CREATE TEMP TABLE reviewed_modules(university_slug TEXT NOT NULL, programme_code TEXT PRIMARY KEY,
 verified BOOLEAN NOT NULL, modules JSONB NOT NULL, curriculum_version TEXT, expected_name_en TEXT, expected_name_zh TEXT, expected_level TEXT, expected_course_fingerprint TEXT) ON COMMIT DROP;
INSERT INTO reviewed_modules VALUES
${values};
DO $$ BEGIN
 IF (SELECT count(*) FROM reviewed_modules) <> ${audit.records.length} THEN RAISE EXCEPTION 'Incomplete audited programme coverage'; END IF;
 IF EXISTS(SELECT 1 FROM reviewed_modules r JOIN programmes p ON p.programme_code=r.programme_code
 JOIN universities u ON u.id=p.university_id LEFT JOIN countries c ON c.id=u.country_id
 WHERE u.slug<>r.university_slug OR COALESCE(c.code,'')<>'MY')
 THEN RAISE EXCEPTION 'Unexpected programme ownership'; END IF;
 IF EXISTS(SELECT 1 FROM reviewed_modules r JOIN programmes p ON p.programme_code=r.programme_code
 LEFT JOIN programme_detail_sections s ON s.programme_id=p.id AND s.section_type='CURRICULUM'
 WHERE md5(COALESCE((SELECT string_agg(${moduleFrame},chr(30) ORDER BY ord)
 FROM jsonb_array_elements(COALESCE(s.course_modules,'[]'::jsonb)) WITH ORDINALITY x(m,ord)),''))<>r.expected_course_fingerprint)
 THEN RAISE EXCEPTION 'Course data changed since collection snapshot'; END IF;
 IF EXISTS(SELECT 1 FROM reviewed_modules r JOIN programmes p ON p.programme_code=r.programme_code
 LEFT JOIN study_levels sl ON sl.id=p.study_level_id
 WHERE r.verified AND (p.name_en IS DISTINCT FROM r.expected_name_en
 OR (r.expected_name_en IS NULL AND p.name_zh IS DISTINCT FROM r.expected_name_zh)
 OR sl.code IS DISTINCT FROM r.expected_level))
 THEN RAISE EXCEPTION 'Programme name or study level changed since source verification'; END IF;
 IF EXISTS(SELECT 1 FROM reviewed_modules r JOIN programmes p ON p.programme_code=r.programme_code
 WHERE r.verified AND NULLIF(BTRIM(p.campus),'') IS NOT NULL)
 THEN RAISE EXCEPTION 'New campus attribution requires explicit course re-verification'; END IF;
 IF EXISTS(SELECT 1 FROM reviewed_modules r WHERE r.verified AND (jsonb_array_length(r.modules)=0 OR EXISTS(
 SELECT 1 FROM jsonb_array_elements(r.modules) m WHERE NULLIF(m->>'nameEn','') IS NULL
 OR m->>'nameEn' ~* '(CGPA|IELTS|TOEFL|entry requirements|minimum (score|grade|average)|[0-9]+[[:space:]]*%)'
 OR NULLIF(m->>'nameZh','') IS NULL OR NULLIF(m->>'translationMethod','') IS NULL
 OR m->>'sourceUrl' NOT LIKE 'https://%' OR NULLIF(m->>'sourceCheckedAt','') IS NULL)))
 THEN RAISE EXCEPTION 'Invalid verified module data'; END IF;
END $$;

-- Preserve every existing curriculum body, status, provenance and timestamp before replacement/hiding.
INSERT INTO programme_curriculum_backups(backup_batch,programme_id,original_section_id,section_data)
SELECT ${quote(batch)},s.programme_id,s.id,to_jsonb(s)
FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id
JOIN reviewed_modules r ON r.programme_code=p.programme_code
JOIN universities u ON u.id=p.university_id AND u.slug=r.university_slug
WHERE s.section_type='CURRICULUM'
ON CONFLICT(backup_batch,original_section_id) DO NOTHING;

UPDATE programme_detail_sections s
SET status='ARCHIVED',curriculum_review_status='PENDING',course_modules='[]'::jsonb,updated_at=CURRENT_TIMESTAMP
FROM programmes p JOIN reviewed_modules r ON r.programme_code=p.programme_code
JOIN universities u ON u.id=p.university_id AND u.slug=r.university_slug
WHERE s.programme_id=p.id AND s.section_type='CURRICULUM' AND NOT r.verified AND p.status='PUBLISHED';

INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,title_en,body_zh,body_en,sort_order,
 source_url,source_checked_at,source_type,source_reference,status,course_modules,curriculum_review_status,curriculum_version)
SELECT p.id,'CURRICULUM','专业课程','Course Modules',
 (SELECT string_agg(m->>'nameZh',E'\\n' ORDER BY ord) FROM jsonb_array_elements(r.modules) WITH ORDINALITY x(m,ord)),
 (SELECT string_agg(m->>'nameEn',E'\\n' ORDER BY ord) FROM jsonb_array_elements(r.modules) WITH ORDINALITY x(m,ord)),
 40,r.modules->0->>'sourceUrl',(r.modules->0->>'sourceCheckedAt')::timestamptz,'official',
 '课程原文来自学校官网；中文为平台译名，非学校官方译名；未核实的元数据留空','PUBLISHED',r.modules,'VERIFIED',r.curriculum_version
FROM reviewed_modules r JOIN programmes p ON p.programme_code=r.programme_code
JOIN universities u ON u.id=p.university_id AND u.slug=r.university_slug
WHERE r.verified AND p.status='PUBLISHED'
ON CONFLICT(programme_id,section_type) DO UPDATE SET body_zh=EXCLUDED.body_zh,body_en=EXCLUDED.body_en,
 title_zh=EXCLUDED.title_zh,title_en=EXCLUDED.title_en,source_url=EXCLUDED.source_url,
 source_checked_at=EXCLUDED.source_checked_at,source_type='official',source_reference=EXCLUDED.source_reference,
 status='PUBLISHED',course_modules=EXCLUDED.course_modules,curriculum_review_status='VERIFIED',
 curriculum_version=EXCLUDED.curriculum_version,updated_at=CURRENT_TIMESTAMP;

DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM reviewed_modules r JOIN programmes p ON p.programme_code=r.programme_code
 LEFT JOIN programme_detail_sections s ON s.programme_id=p.id AND s.section_type='CURRICULUM'
 WHERE p.status='PUBLISHED' AND ((r.verified AND (s.id IS NULL OR s.status<>'PUBLISHED'
 OR s.source_type<>'official' OR s.course_modules<>r.modules OR NULLIF(s.body_zh,'') IS NULL))
 OR (NOT r.verified AND s.status='PUBLISHED')))
 THEN RAISE EXCEPTION 'Course module write-back verification failed'; END IF;
END $$;
-- Structured official modules remain authoritative when a legacy text body is edited.
CREATE OR REPLACE FUNCTION invalidate_curriculum_on_programme_context_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.university_id,NEW.study_level_id,NEW.name_en,NULLIF(BTRIM(NEW.campus),''))
    IS DISTINCT FROM ROW(OLD.university_id,OLD.study_level_id,OLD.name_en,NULLIF(BTRIM(OLD.campus),'')) THEN
  INSERT INTO programme_curriculum_backups(backup_batch,programme_id,original_section_id,section_data)
  SELECT 'context-change-'||md5(random()::text||clock_timestamp()::text),s.programme_id,s.id,to_jsonb(s)
  FROM programme_detail_sections s WHERE s.programme_id=NEW.id AND s.section_type='CURRICULUM' AND s.curriculum_review_status='VERIFIED';
  UPDATE programme_detail_sections SET course_modules='[]'::jsonb,curriculum_review_status='PENDING',status='ARCHIVED',updated_at=CURRENT_TIMESTAMP
  WHERE programme_id=NEW.id AND section_type='CURRICULUM' AND curriculum_review_status='VERIFIED';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_curriculum_programme_ownership ON programmes;
CREATE TRIGGER protect_curriculum_programme_ownership AFTER UPDATE OF university_id,study_level_id,name_en,campus ON programmes
 FOR EACH ROW EXECUTE FUNCTION invalidate_curriculum_on_programme_context_change();
`;
}
if(process.argv[1]?.endsWith('build-official-modules-import.mjs')){
 const [input,output]=process.argv.slice(2);if(!input||!output)throw new Error('用法：node scripts/build-official-modules-import.mjs <审核JSON> <输出SQL>');
 const audit=JSON.parse(await readFile(input,'utf8'));const sql=buildImport(audit);await mkdir(path.dirname(output),{recursive:true});await writeFile(output,sql);
 console.log(JSON.stringify({programmes:audit.records.length,verified:audit.records.filter(r=>r.status==='VERIFIED').length,modules:audit.records.reduce((n,r)=>n+r.modules.length,0)}));
}
