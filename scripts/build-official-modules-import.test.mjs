import test from 'node:test';
import assert from 'node:assert/strict';
import {courseModuleFingerprint} from './course-module-fingerprint.mjs';
import {validateModule,buildImport} from './build-official-modules-import.mjs';
const module={nameZh:'数据库系统',nameEn:'Database Systems',translationMethod:'terminology_reviewed',translationCheckedAt:'2026-10-15T00:00:00Z',courseCode:null,credits:null,requirement:null,
 sourceUrl:'https://study.um.edu.my/programme',sourceCheckedAt:'2026-10-15T00:00:00Z',curriculumVersion:null,evidence:'Database Systems'};
const row={expectedCourseFingerprint:courseModuleFingerprint([]),programmeCode:'UM_001',universitySlug:'um',ownership:{programmeNameEn:'Bachelor of Computer Science',programmeNameZh:'计算机科学学士',studyLevelCode:'BACHELOR'},status:'VERIFIED',modules:[module]};
test('accepts only verbatim officially sourced English titles',()=>{
 assert.deepEqual(validateModule(module,'um'),[]);
 for(const bad of ['CGPA 3.0','Minimum average of 65%','Entry requirements','Year 1','数据库','Pilih 1 Kursus SHE','Kursus Elektif: Rujuk senarai','Univerity Elective Courses: SHE_Cluster 1'])
  assert.ok(validateModule({...module,nameEn:bad,evidence:bad},'um').length);
 assert.ok(validateModule({...module,sourceUrl:'https://example.com/programme'},'um').length);
 assert.ok(validateModule({...module,courseCode:'FAKE123'},'um').length);
 assert.ok(validateModule({...module,credits:'12'},'um').length);
});
test('backs up before any modification and only modifies curriculum sections',()=>{
 const sql=buildImport({records:[row,{...row,programmeCode:'UM_002',status:'PENDING',modules:[]}]});
 assert.ok(sql.indexOf('INSERT INTO programme_curriculum_backups')<sql.indexOf('UPDATE programme_detail_sections'));
 assert.ok(sql.includes("s.section_type='CURRICULUM'"));
 assert.ok(sql.includes("status='ARCHIVED'"));assert.ok(!/DELETE FROM|UPDATE programmes|CAREER_OPPORTUNITIES/.test(sql));
});
test('refuses duplicate programme/module records and pending module claims',()=>{
 assert.throws(()=>buildImport({records:[row,row]}),/重复/);
 assert.throws(()=>buildImport({records:[{...row,modules:[module,module]}]}),/重复/);
 assert.throws(()=>buildImport({records:[{...row,status:'PENDING'}]}),/待核实/);
});

test('requires Chinese display and separate translation provenance',()=>{
 assert.ok(validateModule({...module,nameZh:'Database Systems'},'um').length);
 assert.ok(validateModule({...module,translationMethod:null},'um').length);
 assert.ok(validateModule({...module,descriptionEn:'Official description',descriptionZh:null},'um').length);
});


test('full reviewed snapshot, backups and generated migration agree for every published programme',async()=>{
 const {readFile}=await import('node:fs/promises');
 const audit=JSON.parse(await readFile(new URL('../outputs/official-course-modules-20261015/reviewed-audit.json',import.meta.url),'utf8'));
 const backup=JSON.parse(await readFile(new URL('../outputs/official-course-modules-20261015/original-curricula.json',import.meta.url),'utf8'));
 assert.deepEqual(audit.records.map(r=>r.programmeCode).sort(),backup.records.map(r=>r.programmeCode).sort());
 assert.equal(audit.records.length,audit.summary.checkedProgrammes);
 assert.equal(audit.records.reduce((n,r)=>n+r.modules.length,0),audit.summary.verifiedModuleAssociations);
 const sql=await readFile(new URL('../backend/src/main/resources/db/migration/V64__refine_verified_course_modules.sql',import.meta.url),'utf8');
 assert.equal(buildImport(audit),sql);
});


test('does not treat overseas or college group websites as the matching Malaysian university',()=>{
 assert.ok(validateModule({...module,sourceUrl:'https://www.monash.edu/study/australia'},'monash').length);
 assert.ok(validateModule({...module,sourceUrl:'https://www.southampton.ac.uk/courses/uk'},'southampton').length);
 assert.ok(validateModule({...module,sourceUrl:'https://sunway.edu.my/college/course'},'sunway').length);
});

test('course snapshot fingerprints ignore key order and detect every reviewed field change',()=>{
 assert.equal(courseModuleFingerprint([{nameEn:'Database',nameZh:'数据库'}]),courseModuleFingerprint([{nameZh:'数据库',nameEn:'Database',credits:null}]));
 assert.notEqual(courseModuleFingerprint([module]),courseModuleFingerprint([{...module,nameZh:'新译名'}]));
 assert.throws(()=>buildImport({records:[{...row,expectedCourseFingerprint:null}]}),/快照指纹/);
});
