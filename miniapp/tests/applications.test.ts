import assert from 'node:assert/strict';
import test from 'node:test';
import {mapApplicationDetail,mapApplicationPage,validApplicationId} from '../miniprogram/services/applications.ts';
import {applicationTimeline} from '../miniprogram/utils/application-timeline.ts';
const id='00000000-0000-4000-8000-000000000001';
const application={id,reference:'APP-TEST',universitySlug:'segi-university',universityName:'测试院校',programmeName:'测试专业',level:'本科',subject:'BUSINESS',status:'NEEDS_DOCUMENTS',stage:2,note:'等待材料',createdAt:'2026-10-09T09:00:00Z'};
const document={id,title:'语言成绩',stage:2,status:'REJECTED',reviewNote:'请补充清晰文件',filename:'language.pdf',updatedAt:'2026-10-09T09:00:00Z'};
test('rejects malformed application records rather than showing invented statuses',()=>{
 for(const patch of [{status:'UNKNOWN'},{stage:9},{id:'../../other'},{createdAt:'bad'}]) assert.equal(mapApplicationPage({items:[{...application,...patch}],hasMore:false}).ok,false);
 assert.equal(validApplicationId('../account'),false);
});
test('empty orders are a valid result, malformed data is an error',()=>{
 assert.deepEqual(mapApplicationPage({items:[],hasMore:false}),{ok:true,value:{items:[],hasMore:false}});
 assert.equal(mapApplicationPage({items:null,hasMore:false}).ok,false);
});
test('builds the eight-stage timeline with real document counts and review notes',()=>{
 const result=mapApplicationDetail({application,documents:[document],fees:[],history:[]});assert.ok(result.ok);
 const steps=applicationTimeline(result.value);assert.equal(steps.length,8);assert.equal(steps[1]?.current,true);assert.equal(steps[1]?.total,1);assert.equal(steps[1]?.approved,0);assert.equal(steps[1]?.needsUpload,true);assert.match(steps[1]?.reviewNotes??'',/语言成绩/);
 assert.equal(steps[2]?.date,'');assert.equal(steps[2]?.fees.length,0);
});
test('closed applications never offer a replacement upload',()=>{
 for(const status of ['COMPLETED','CANCELLED']){const result=mapApplicationDetail({application:{...application,status},documents:[document],fees:[],history:[]});assert.ok(result.ok);assert.equal(result.value.documents[0]?.editable,false);assert.equal(applicationTimeline(result.value).some(s=>s.current),false);}
});
test('submitted and approved documents are not editable',()=>{
 for(const status of ['APPROVED','SUBMITTED']){const result=mapApplicationDetail({application,documents:[{...document,status}],fees:[],history:[]});assert.ok(result.ok);assert.equal(result.value.documents[0]?.editable,false);}
});
test('validates fees and preserves currency without implying free service',()=>{
 const fee={id,title:'申请费',amount:100,currency:'MYR',status:'DUE',stage:3};
 const result=mapApplicationDetail({application,documents:[],fees:[fee],history:[]});assert.ok(result.ok);assert.equal(result.value.fees[0]?.displayAmount,'MYR 100.00');
 for(const patch of [{amount:-1},{amount:Infinity},{currency:'BAD-CODE'},{status:'FAKE'}])assert.equal(mapApplicationDetail({application,documents:[],fees:[{...fee,...patch}],history:[]}).ok,false);
});
