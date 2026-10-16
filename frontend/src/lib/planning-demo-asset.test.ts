import test from 'node:test';
import assert from 'node:assert/strict';
import {planningDemoAsset} from './planning-demo-asset.ts';
test('only development can read allowlisted chat assets, never arbitrary files',async()=>{
  let reads=0;
  const read=async(name:string)=>{reads++;return name;};
  assert.equal((await planningDemoAsset('index.html','production',read)).status,404);
  assert.equal((await planningDemoAsset('../.env','development',read)).status,404);
  assert.equal(reads,0);
  const page=await planningDemoAsset('index.html','development',read);
  assert.equal(page.status,200);assert.equal(await page.text(),'planning-agent.html');
  assert.equal(page.headers.get('Cache-Control'),'no-store');
  assert.match(page.headers.get('Content-Type')!,/text\/html/);
  assert.equal((await planningDemoAsset('planning-chat.js','development',async()=>{throw Error();})).status,503);
});
