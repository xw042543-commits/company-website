import assert from "node:assert/strict";
import test from "node:test";
import {uploadExcel, importFields, rowLabel, type ImportRow} from "./admin-import-api.ts";
test("Excel upload uses credentialed multipart and server csrf without overriding the boundary", async()=>{
 const previous=globalThis.fetch;const calls: RequestInit[]=[];
 globalThis.fetch=(async (_url,init)=>{calls.push(init!);return calls.length===1?Response.json({headerName:"X-XSRF-TOKEN",token:"token"}):Response.json({batch:{id:"batch"}});}) as typeof fetch;
 try{const file=new File(["xlsx"],"院校.xlsx");const result=await uploadExcel("http://localhost:3000","UNIVERSITY",file);assert.equal(result.status,"ready");assert.equal(calls.length,2);assert.equal(calls[1].credentials,"include");const headers=new Headers(calls[1].headers);assert.equal(headers.get("X-XSRF-TOKEN"),"token");assert.equal(headers.has("Content-Type"),false);assert.ok(calls[1].body instanceof FormData);assert.equal(calls[1].body.get("type"),"UNIVERSITY");}finally{globalThis.fetch=previous;}
});
test("forbidden uploads return an error and never imply draft creation",async()=>{const previous=globalThis.fetch;let n=0;globalThis.fetch=(async()=>++n===1?Response.json({headerName:"X-XSRF-TOKEN",token:"token"}):Response.json({message:"无权限"},{status:403})) as typeof fetch;try{assert.deepEqual(await uploadExcel("http://localhost:3000","PROGRAMME",new File(["x"],"p.xlsx")),{status:"forbidden",message:"无权限"});}finally{globalThis.fetch=previous;}});
test("templates distinguish programme relationships and preserve published row status",()=>{assert.ok(importFields("PROGRAMME").some(f=>f.key === "campus"));assert.ok(importFields("PROGRAMME").some(f=>f.key === "studyLevelCode"));assert.equal(importFields("UNIVERSITY").filter(f=>f.key === "universityCode").length,1);assert.equal(rowLabel({classification:"NEW",draftStatus:"PUBLISHED"} as ImportRow),"已发布");assert.equal(rowLabel({classification:"CONFLICT",draftStatus:"NOT_DRAFT"} as ImportRow),"字段冲突");});
