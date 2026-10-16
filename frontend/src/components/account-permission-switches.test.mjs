import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import test from "node:test";
import {JSDOM} from "jsdom";
import {act,createElement,useState} from "react";
import {createRoot} from "react-dom/client";
import ts from "typescript";
const require=createRequire(import.meta.url);
const {outputText}=ts.transpileModule(readFileSync(new URL("./account-permission-switches.tsx",import.meta.url),"utf8"),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},
});
const componentModule={exports:{}};
new Function("require","module","exports",outputText)(name=>name.endsWith(".module.css")?{default:{permissionControls:"permissions"}}
  :name==="@/lib/admin-account-api"?require("../lib/admin-account-api.ts"):require(name),componentModule,componentModule.exports);
const {AccountPermissionSwitches}=componentModule.exports;
test("two checked permissions can be toggled independently without losing the other",async()=>{
  const dom=new JSDOM("<!doctype html><div id='root'></div>");
  const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
  const element=dom.window.document.getElementById("root"),root=createRoot(element),changes=[];
  function Harness({busy=false}){
    const [permissions,setPermissions]=useState(["ADMIN","ADVISER"]);
    return createElement(AccountPermissionSwitches,{account:{id:2,fullName:"双权限账号",role:"ADMIN",permissions,status:"ACTIVE",advanced:false},self:1,busy,
      onChange:(permission,enabled)=>{changes.push({permission,enabled});setPermissions(old=>enabled?[...old,permission]:old.filter(p=>p!==permission));}});
  }
  const inputs=()=>[...element.querySelectorAll("input")];
  try{
    await act(()=>root.render(createElement(Harness)));
    assert.deepEqual(inputs().map(i=>i.type),["checkbox","checkbox"]);
    assert.deepEqual(inputs().map(i=>i.checked),[true,true]);
    await act(()=>inputs()[0].click());
    assert.deepEqual(inputs().map(i=>i.checked),[false,true]);
    await act(()=>inputs()[0].click());
    await act(()=>inputs()[1].click());
    assert.deepEqual(inputs().map(i=>i.checked),[true,false]);
    assert.deepEqual(changes,[{permission:"ADMIN",enabled:false},{permission:"ADMIN",enabled:true},{permission:"ADVISER",enabled:false}]);
    await act(()=>root.render(createElement(Harness,{busy:true})));
    assert.ok(inputs().every(i=>i.disabled));
  }finally{await act(()=>root.unmount());dom.window.close();Object.assign(globalThis,previous);}
});
