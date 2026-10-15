import test from 'node:test';
import assert from 'node:assert/strict';
import {translateModule} from './localize-official-modules.mjs';
const stamp='2026-10-15T00:00:00Z';
test('retains original evidence and marks platform translation separately',()=>{
 const module={nameEn:'Database Systems',evidence:'CS100 Database Systems',courseCode:'CS100'};
 const result=translateModule(module,{'Database Systems':{nameZh:'数据库系统',translatedAt:stamp}}, {},stamp);
 assert.equal(result.nameZh,'数据库系统');assert.equal(result.nameEn,module.nameEn);
 assert.equal(result.evidence,module.evidence);assert.equal(result.descriptionZh,null);
 assert.equal(result.translationMethod,'machine_translation_glossary_checked');
});
test('uses reviewed terminology ignoring case, and never invents missing translations or descriptions',()=>{
 assert.equal(translateModule({nameEn:'CAPSTONE PROJECT'}, {},{'Capstone Project':'综合项目'},stamp)?.nameZh,'综合项目');
 assert.equal(translateModule({nameEn:'Unknown module'}, {},{},stamp),null);
 assert.equal(translateModule({nameEn:'Database',descriptionEn:'Official original'}, {'Database':{nameZh:'数据库'}},{},stamp),null);
});
