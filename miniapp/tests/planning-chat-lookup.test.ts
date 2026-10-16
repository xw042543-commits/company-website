import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupReply } from '../scripts/planning-chat-lookup';

test('queries only explicit keywords and degree and labels database results unverified', async () => {
  const answer = await lookupReply('计算机硕士', async (url, init) => {
    assert.equal(String(url), '/api/v1/admin/planning/programme-lookup?keyword=%E8%AE%A1%E7%AE%97%E6%9C%BA&level=MASTER&page=0');
    assert.equal(init?.credentials, 'same-origin');
    return Response.json({page:0,size:20,hasNext:true,items:[{
      programmeId:1,nameZh:'计算机科学',nameEn:'Computer Science',university:'测试大学',level:'MASTER',
      admissionsZh:'IELTS 6.5',admissionsEn:null,admissionsStatus:'AI_GENERATED_UNVERIFIED',
      admissionsSource:{url:'https://example.edu/admissions',type:'ai_generated',reference:'Guide',checkedAt:null},
      catalogueSource:{url:'javascript:alert(1)',type:'official',reference:null,checkedAt:null},
      tuitionMin:10000,tuitionMax:20000,currency:'MYR',tuitionDisplay:null,feesStatus:'REVIEW_REQUIRED',usableForAssessment:false,
    }]});
  });
  assert.match(answer,/测试大学/); assert.match(answer,/计算机科学/);
  assert.match(answer,/测试大学 · 硕士/);
  assert.match(answer,/待核实/); assert.match(answer,/AI 生成/);
  assert.match(answer,/https:\/\/example.edu\/admissions/);
  assert.doesNotMatch(answer,/javascript:|保证录取/);
  assert.match(answer,/还有更多/);
});
test('empty results are honest and authentication failures are actionable', async () => {
  assert.match(await lookupReply('设计',async()=>Response.json({page:0,size:20,hasNext:false,items:[]})),/未找到/);
  for(const code of [401,403,500]) await assert.rejects(lookupReply('本科',async()=>new Response('',{status:code})),/登录|权限|暂时/);
});
test('does not send oversized or ambiguous degree queries and rejects malformed payload', async () => {
  const noRequest: typeof fetch = async()=>{ throw new Error('should not request'); };
  assert.match(await lookupReply('本科硕士',noRequest),/一个学历/);
  assert.match(await lookupReply('x'.repeat(201),noRequest),/200/);
  await assert.rejects(lookupReply('计算机',async()=>Response.json({items:[{}]})),/格式/);
});
